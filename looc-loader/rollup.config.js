import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.tsx",
  plugins: [
    commonjs({ sourceMap: false }),
    resolve({ preferBuiltins: false }),
    typescript(),
    json(),
  ],
  output: [
    {
      file: "build/index.cjs.js",
      format: "cjs",
    },
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
