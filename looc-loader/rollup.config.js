import typescript from "rollup-plugin-typescript2";
import webImports from "rollup-plugin-web-imports";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.tsx",
  plugins: [
    typescript(),
    webImports({
      react: "./react.js",
      "react-dom": "./react-dom.js",
    }),
    copy(
      process.env.DEV && {
        targets: [
          { src: "web_modules/*", dest: "build" },
          { src: "html/*", dest: "build" },
        ],
      }
    ),
    process.env.DEV && serve("build"),
    process.env.DEV && livereload({ watch: "build" }),
  ],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
