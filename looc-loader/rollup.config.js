import typescript from "rollup-plugin-typescript2";
import webImports from "./plugins/rollup-plugin-web-imports";

export default {
  input: "src/index.tsx",
  // external: ["react", "react-dom"],
  plugins: [typescript(), webImports()],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
