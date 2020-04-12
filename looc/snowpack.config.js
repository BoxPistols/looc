module.exports = {
  webDependencies: ["looc-loader"],
  installOptions: {
    dest: "src/web_modules",
    clean: false,
    optimize: false,
    babel: false,
    strict: false,
    sourceMap: true,
    remoteUrl: "https://cdn.pika.dev",
    externalPackage: ["./react.js", "./react-dom.js"],
  },
  namedExports: {},
  rollup: {
    plugins: [],
  },
};
