import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs", // CommonJS 格式；可以换成 'esm' 支持 ESM
  },
  plugins: [
    copy({
      targets: [{ src: "src/snipeets", dest: "dist" }],
    }),
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
  ],
  external: ["openapi-typescript", "prettier"],
};
