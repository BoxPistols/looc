import typescript from "rollup-plugin-typescript2";
import webImports from "rollup-plugin-web-imports";

export default {
  input: "src/index.tsx",
  // external: ["react", "react-dom"],
  plugins: [
    typescript(),
    webImports({ react: "./react.js", "react-dom": "./react-dom.js" }),
  ],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
