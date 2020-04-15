import sade from "sade";
import { start } from "./start";

const cli = sade("looc");

cli.version("0.4.0");

cli
  .command("start <filepath>")
  .describe("Compile and load component in a sandbox")
  .option("--css", "Use imported CSS")
  .option("--css-modules", "Use CSS modules")
  .option("--emotion", "Use emotion")
  .option("--styled-components", "Use styled-components")
  .option("--clean", "Remove cache folder")
  .option("--without-props", "Do not attempt to parse prop types")
  .action(start);

export const run = () => cli.parse(process.argv);
