import typescript from "rollup-plugin-typescript2";
import webImports from "rollup-plugin-web-imports";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";

const { BUILD } = process.env;

export default {
  input: "src/index.tsx",
  plugins: [
    typescript(),
    replace({ __DEBUG__: BUILD === "development" }),
    webImports({
      react: "./react.js",
      "react-dom": "./react-dom.js",
      "@material-ui/core": "./@material-ui/core.js",
    }),
    BUILD === "development" &&
      copy({
        targets: [
          { src: "src/web_modules/*", dest: "build" },
          { src: "html/*", dest: "build" },
        ],
      }),
    BUILD === "development" && serve("build"),
    BUILD === "development" && livereload({ watch: "build" }),
  ],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
