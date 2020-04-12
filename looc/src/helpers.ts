import type { extractInterfaces } from "tsx-ray";
import execa from "execa";
import fs from "fs-extra";
import path from "path";

type Interfaces = ReturnType<typeof extractInterfaces>;

export const getPropTypesByComponent = (componentName: string) => (
  interfaces: Interfaces
) => {
  const propTypes = `${componentName}Props`;
  return interfaces[propTypes];
};

export type StyleLibrary =
  | "@emotion/core"
  | "styled-components"
  | "react"
  | "react-dom"
  | "";

export const snowpackInstall = async (libs: StyleLibrary[], dest: string) => {
  const snowpackConfig = {
    webDependencies: [...libs],
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
  await execa(`yarn dlx snowpack --config ${configPath} --source pika`);
};
