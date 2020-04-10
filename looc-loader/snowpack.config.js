module.exports = {
  webDependencies: ["react", "react-dom"],
  installOptions: {
    dest: "src/web_modules",
    clean: false,
    optimize: false,
    babel: false,
    strict: false,
    sourceMap: true,
    remoteUrl: "https://cdn.pika.dev",
  },
  namedExports: {},
  rollup: {
    plugins: [],
  },
};
