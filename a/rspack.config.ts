import { defineConfig } from "@rspack/cli";
import { rspack, type SwcLoaderOptions } from "@rspack/core";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["last 2 versions", "> 0.2%", "not dead", "Firefox ESR"];

const is_dev = process.env.AAARG === "dev";

export default defineConfig({
	entry: {
		main: "./src/main.ts"
	},
	resolve: {
		extensions: ["...", ".ts"]
	},
	output: {
		path: `${__dirname}/../static`,
		filename: "client.js",
		publicPath: is_dev ? "/" : "./"
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.vert$/,
				type: "asset/source"
			},
			{
				test: /\.frag$/,
				type: "asset/source"
			},
			{
				test: /\.js$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "ecmascript"
								}
							},
							env: { targets }
						} satisfies SwcLoaderOptions
					}
				]
			},
			{
				test: /\.ts$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript"
								}
							},
							env: { targets }
						} satisfies SwcLoaderOptions
					}
				]
			}
		]
	},
	plugins: [new rspack.HtmlRspackPlugin({ template: "./index.html" })],
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	experiments: {
		css: true
	}
});
