import typescript from "rollup-plugin-typescript2";
import esmImportToUrl from "rollup-plugin-esm-import-to-url";

export default {
  input: "src/index.tsx",
  external: ["react", "react-dom"],
  plugins: [
    typescript(),
    esmImportToUrl({
      react: "https://cdn.pika.dev/react/^16.8.0",
      "react-dom": "https://cdn.pika.dev/react/^16.8.0",
    }),
  ],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
