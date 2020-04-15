import { extractInterfaces, getDefaultImports } from "tsx-ray";
import { Project } from "ts-morph";
import ts from "typescript";
import path from "path";
import handler from "serve-handler";
import http from "http";
import fs from "fs-extra";
import rollup from "rollup";
import chalk from "chalk";
import typescript from "rollup-plugin-typescript2";
import webImports from "rollup-plugin-web-imports";
import postcss from "rollup-plugin-postcss";
import { snowpackInstall, readCachedData } from "./helpers";

const REQUIRED_LIBS = ["react", "react-dom", "@material-ui/core"];

export const start = async (
  filepath: string,
  options: Record<string, boolean>
) => {
  try {
    const cwd = process.cwd();

    const htmlDir = path.join(`${__dirname}`, `html`);
    const modulesDir = path.join(`${__dirname}`, `web_modules`);
    const cacheDir = path.join(cwd, `.cache`);

    const isEmotion = options["emotion"];

    const project = new Project({
      compilerOptions: {
        outDir: path.join(cacheDir),
        module: ts.ModuleKind.ESNext,
        declaration: false,
        jsx: isEmotion ? ts.JsxEmit.None : ts.JsxEmit.React,
      },
    });

    const sourceFile = project.addSourceFileAtPath(filepath);
    const sourceFilename = sourceFile.getBaseName().replace(".tsx", ".js");
    const defaultImports = getDefaultImports(sourceFile);

    const reactImport = defaultImports.find(
      (imp) => imp.getDefaultImport()!.getText() === "React"
    );

    if (!reactImport) {
      throw Error(
        chalk.bold.red(
          `Could not find React import in ${filepath}! Are you sure you are trying to open a React file?`
        )
      );
    }

    const parsedInterfaces = extractInterfaces(sourceFile);

    if (Object.keys(parsedInterfaces).length === 0) {
      throw Error(chalk.bold.red("No interfaces found!"));
    }

    const styleLibs = Object.entries(options).map(([lib, value]) => {
      if (value) {
        if (lib === "emotion") return ["@emotion/core", "@emotion/styled"];
        if (lib === "styled-components") return lib;
      }
      return "";
    });

    if (options.clean) {
      try {
        await fs.remove(cacheDir);
      } catch {
        throw Error(chalk.bold.red(`Could not remove ${cacheDir}!`));
      }
    }

    const allLibs = [...styleLibs.flat().filter(Boolean), ...REQUIRED_LIBS];

    const cachedData = await readCachedData(cacheDir);
    const installedLibs = cachedData ? cachedData.installedLibs : [];

    console.log("Skipping previously installed libraries: ", installedLibs);

    await fs.ensureDir(cacheDir);

    const uninstalledLibs = cachedData
      ? allLibs.filter((lib) => !installedLibs.includes(lib))
      : allLibs;

    if (uninstalledLibs.length > 0) {
      console.log("Installing libraries: ", uninstalledLibs);
    }

    try {
      await snowpackInstall(uninstalledLibs, cacheDir);
    } catch {
      throw Error(chalk.bold.red(`Failed to install required libraries!`));
    }

    const data = {
      interfaces: parsedInterfaces,
      filepath: sourceFilename,
      installedLibs: allLibs,
    };

    await fs.writeFile(path.join(cacheDir, "data.json"), JSON.stringify(data));

    console.log("Install finished!");

    const otherWebImports = Object.keys(options).reduce(
      (imports: object, opt: string) => {
        if (options[opt]) {
          if (opt === "emotion") {
            return {
              ...imports,
              "@emotion/core": "./web_modules/@emotion/core.js",
              "@emotion/styled": "./web_modules/@emotion/styled.js",
            };
          }
          if (opt === "styled-components") {
            return {
              ...imports,
              "styled-components": "./web_modules/styled-components.js",
            };
          }
        }
        return imports;
      },
      {}
    );

    const inputOpts = {
      input: path.join(cwd, filepath),
      plugins: [
        typescript(),
        postcss({
          modules: options["css-modules"],
          plugins: [],
        }),
        webImports({
          react: "./web_modules/react.js",
          "react-dom": "./web_modules/react-dom.js",
          ...otherWebImports,
        }),
      ],
    };

    const outputOpts = {
      dir: cacheDir,
    };

    //project.emitSync();

    const bundle = await rollup.rollup(inputOpts);

    await bundle.generate(outputOpts);

    await bundle.write(outputOpts);

    await fs.copy(htmlDir, cacheDir);
    await fs.copy(modulesDir, path.join(cacheDir, "web_modules"));

    const server = http.createServer((request, response) => {
      // You pass two more arguments for config and middleware
      // More details here: https://github.com/zeit/serve-handler#options
      return handler(request, response, {
        public: path.join(cwd, `.cache`),
        headers: [
          {
            source: "/web_modules/import-map.json",
            headers: [
              { key: "Content-Type", value: "application/importmap+json" },
            ],
          },
        ],
      });
    });

    server.listen(3000, () => {
      console.log("Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(
      `${chalk.bold.whiteBright(`LOOC ERROR:`)} ${chalk.bold.red(e.message)}`
    );
  }
};
