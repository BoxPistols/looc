export default function plugin() {
  return {
    name: "rollup-plugin-web-imports", // this name will show up in warnings and errors
    resolveId(source) {
      if (source === "react") {
        return { id: "./react.js", external: true }; // this signals that rollup should not ask other plugins or check the file system to find this id
      }
      if (source === "react-dom") {
        return { id: "./react-dom.js", external: true }; // this signals that rollup should not ask other plugins or check the file system to find this id
      }
      return null; // other ids should be handled as usually
    },
  };
}
