import type { extractInterfaces } from "tsx-ray";
import execa from "execa";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

type Interfaces = ReturnType<typeof extractInterfaces>;

export type StyleLibrary =
  | "@emotion/core"
  | "styled-components"
  | "react"
  | "react-dom"
  | "";

export type PkgManager = "yarn" | "npx";

export const getPropTypesByComponent = (componentName: string) => (
  interfaces: Interfaces
) => {
  const propTypes = `${componentName}Props`;
  return interfaces[propTypes];
};

export const snowpackInstall = async (libs: StyleLibrary[], dest: string) => {
  if (libs.length === 0) {
    return;
  }
  const snowpackConfig = {
    webDependencies: libs,
    installOptions: {
      dest: path.join(dest, "web_modules"),
      clean: false,
      optimize: false,
      babel: false,
      strict: false,
      sourceMap: true,
    },
  };

  const configPath = path.join(dest, "snowpack.config.json");

  await fs.outputJSON(configPath, snowpackConfig);

  await execa("npx", [
    `snowpack`,
    `--config`,
    `${configPath}`,
    `--source`,
    `pika`,
  ]);
};

export const readCachedData = async (cacheDir: string) => {
  let data = null;
  try {
    data = await fs.readJSON(path.join(cacheDir, "data.json"));
  } catch {
    throw Error(chalk.bold.red(`Count not read data.json`));
  } finally {
    return data;
  }
};
