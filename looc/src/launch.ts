import { extractInterfaces, getDefaultImports } from "tsx-ray";
import { Project } from "ts-morph";
import ts from "typescript";
import path from "path";
import handler from "serve-handler";
import http from "http";
import fs from "fs-extra";
import rollup from "rollup";
import typescript from "rollup-plugin-typescript2";
import webImports from "rollup-plugin-web-imports";
import postcss from "rollup-plugin-postcss";
import { snowpackInstall, readCachedData } from "./helpers";

const REQUIRED_LIBS = ["react", "react-dom", "@material-ui/core"];

export const launch = async (
  filepath: string,
  options: Record<string, boolean>
) => {
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
    console.error("React import not found!");
    process.exit(1);
  }

  const parsedInterfaces = extractInterfaces(sourceFile);

  const styleLibs = Object.entries(options).map(([lib, value]) => {
    if (value) {
      if (lib === "emotion") return ["@emotion/core", "@emotion/styled"];
      if (lib === "styled-components") return lib;
    }
    return "";
  });

  if (options.clean) {
    await fs.remove(cacheDir);
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

  await snowpackInstall(uninstalledLibs, cacheDir);

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
};
