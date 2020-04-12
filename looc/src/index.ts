import sade from "sade";
import { extractInterfacesFromFile } from "tsx-ray";
import { launch } from "./launch";

const cli = sade("storyline");

cli.version("0.1.0");

cli
  .command("hello")
  .describe("Say hello!")
  .action(() => console.log("Hello!"));

cli
  .command("parse <filepath>")
  .describe("Parse interfaces")
  .action((filepath: string) => {
    const result = extractInterfacesFromFile(filepath);
    console.log(JSON.stringify(result, null, 2));
  });

cli
  .command("launch <filepath>")
  .option("--css", "Use imported CSS")
  .option("--css-modules", "Use CSS modules")
  .option("--emotion", "Use emotion")
  .option("--styled-components", "Use styled-components")
  .action(launch);

export const run = () => cli.parse(process.argv);
