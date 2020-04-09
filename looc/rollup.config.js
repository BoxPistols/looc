import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  plugins: [
    json(),
    resolve({ preferBuiltins: true }),
    commonjs({ sourceMap: false }),
    typescript(),
  ],
  output: {
    dir: "build",
  },
};
