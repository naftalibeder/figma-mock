const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",
  // Necessary because Figma's 'eval' works differently.
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry: {
    window: "./src/window.ts", // The entry point for GUI code.
    code: "./src/code.ts", // The entry point for plugin code.
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader", // Creates `style` nodes from JS strings.
          "css-loader", // Translates CSS into CommonJS.
          "sass-loader", // Compiles Sass to CSS.
        ],
      },
    ],
  },
  resolve: { extensions: [".ts", ".js"] },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"), // Compiles into a folder called "dist".
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/window.html",
      filename: "window.html",
      chunks: ["window"],
      inject: "body",
      cache: false, // Required to update inline JS.
    }),
    new HtmlInlineScriptPlugin([/window.js/]),
  ],
});
