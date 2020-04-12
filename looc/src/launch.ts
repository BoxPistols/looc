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
// import execa from "execa";
// import hasYarn from "has-yarn";
import { snowpackInstall } from "./helpers";

export const launch = async (
  filepath: string,
  options: Record<string, boolean>
) => {
  const cwd = process.cwd();

  const htmlDir = path.join(`${__dirname}`, `html`);
  const modulesDir = path.join(`${__dirname}`, `web_modules`);

  const cacheDir = path.join(cwd, `.cache`);

  const project = new Project({
    compilerOptions: {
      outDir: path.join(cacheDir),
      module: ts.ModuleKind.ESNext,
      declaration: false,
      jsx: ts.JsxEmit.React,
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

  const data = {
    interfaces: parsedInterfaces,
    filepath: sourceFilename,
  };

  if (!fs.existsSync(cacheDir)) {
    await fs.mkdir(cacheDir);
  } else {
    await fs.remove(cacheDir);
    await fs.mkdir(cacheDir);
  }

  const libsToInstall = Object.entries(options).map(([lib, value]) => {
    if (value) {
      if (lib === "emotion") return "@emotion/core";
      if (lib === "styled-components") return lib;
    }
    return "";
  });

  await snowpackInstall(
    [...libsToInstall.filter(Boolean), "react", "react-dom"],
    cacheDir
  );

  const otherWebImports = Object.keys(options).reduce(
    (imports: object, opt: string) => {
      if (options[opt]) {
        if (opt === "emotion") {
          return {
            ...imports,
            "@emotion/core": "/web_modules/emotion.js",
          };
        }
        if (opt === "styled-components") {
          return {
            ...imports,
            "styled-components": "/web_modules/styled-components.js",
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

  await fs.writeFile(path.join(cacheDir, "data.json"), JSON.stringify(data));

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
