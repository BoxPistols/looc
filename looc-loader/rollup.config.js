import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.tsx",
  external: ["react", "react-dom"],
  plugins: [typescript()],
  output: [
    {
      file: "build/index.esm.js",
      format: "es",
    },
  ],
};
