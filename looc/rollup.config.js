import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  external: [
    "react",
    "react-dom",
    "react-is",
    "prop-types",
    "execa",
    "path",
    "http",
    "typescript",
    "rollup-plugin-postcss",
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
  plugins: [
    typescript(),
    copy({
      targets: [
        { src: "src/web_modules", dest: "build" },
        { src: "html", dest: "build" },
      ],
    }),
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
