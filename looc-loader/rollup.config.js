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
      react: "./web_modules/react.js",
      "react-dom": "./web_modules/react-dom.js",
    }),
    copy({
      targets: [
        { src: "web_modules", dest: "build" },
        { src: "html/*", dest: "build" },
      ],
    }),
    serve("build"),
    livereload({ watch: "build" }),
  ],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
