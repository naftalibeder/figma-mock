const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry: {
    window: "./src/window.ts", // The entry point for GUI code
    code: "./src/code.ts", // The entry point for plugin code
  },
  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      { test: /\.(png|jpg|gif|svg|webp)$/, type: "asset/inline" },
      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      // Enables SCSS (by doing "import './file.scss'" in your TypeScript code)
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader", // Creates `style` nodes from JS strings
          "css-loader", // Translates CSS into CommonJS
          "sass-loader", // Compiles Sass to CSS
        ],
      },
    ],
  },
  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: [".ts", ".js"] },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"), // Compile into a folder called "dist"
  },
  // Tells Webpack to generate "window.html" and to inline "window.js" into it
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/window.html",
      filename: "window.html",
      chunks: ["window"],
      inject: "body",
      cache: false, // required to update inline js
    }),
    new HtmlInlineScriptPlugin([/window.js/]),
  ],
});
