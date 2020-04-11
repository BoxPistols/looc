import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  external: [
    "path",
    "http",
    "typescript",
    "rollup-plugin-typescript2",
    "rollup",
    "ts-morph",
    "tsx-ray",
    "sade",
    "serve-handler",
    "rollup",
    "fs-extra",
    "@rollup/plugin-commonjs",
    "@rollup/plugin-node-resolve",
    "rollup-plugin-typescript2",
    "rollup-plugin-web-imports",
  ],
  plugins: [typescript()],
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
