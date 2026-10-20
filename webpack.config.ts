import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import fs from 'node:fs';
import MinimizerPlugin from 'minimizer-webpack-plugin';
import { collectTikZAssets } from './script/helper/tikz-assets.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default (_environment: unknown, arguments_: { mode?: 'development' | 'production' }): webpack.Configuration => ({
  name: 'markdown-document',
  mode: arguments_.mode ?? 'production',
  entry: {
    'markdown-document': path.join(directory, 'src', 'markdown-document.ts'),
    core: path.join(directory, 'src', 'markdown-core.ts'),
    component: path.join(directory, 'src', 'markdown-component.ts'),
    'component-register': path.join(directory, 'src', 'markdown-component-register.ts'),
    extensions: path.join(directory, 'src', 'markdown-extensions.ts'),
    mathjslab: path.join(directory, 'src', 'markdown-mathjslab.ts'),
    'mathjslab-worker': path.join(directory, 'src', 'markdown-mathjslab-worker.ts'),
    hdl: path.join(directory, 'src', 'markdown-hdl.ts'),
  },
  experiments: { outputModule: true },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader', options: { configFile: 'tsconfig.build.json' } }],
      },
      { test: /\.css$/i, resourceQuery: /inline/, type: 'asset/source' },
      { test: /run-tex\.js$/i, resourceQuery: /url/, type: 'asset/resource', generator: { filename: 'tikzjax/run-tex.js' } },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: { module: false },
    extensionAlias: { '.js': ['.js', '.ts'] },
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: { chunks: 'all' },
    // Font glyph chunks add many independent assets; bound minifier memory.
    minimizer: [new MinimizerPlugin({ parallel: 2 })],
  },
  ignoreWarnings: [
    {
      module: /node_modules[\\/]mathjax[\\/]tex-svg\.js$/,
      message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    },
  ],
  output: {
    path: path.join(directory, 'dist', 'browser'),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].[contenthash:8].js',
    library: { type: 'module' },
    publicPath: 'auto',
    clean: true,
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^elkjs$/, (resource) => {
      if (/[\\/]netlistsvg[\\/]/.test(resource.context)) resource.request = path.join(directory, 'node_modules/netlistsvg/node_modules/elkjs/lib/elk.bundled.js');
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /^node:module$/ }),
    {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('TikZRuntimeAssets', (compilation) => {
          compilation.hooks.processAssets.tap({ name: 'TikZRuntimeAssets', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, () => {
            const hdl = path.join(directory, 'assets', 'hdl');
            const copyHDL = (folder: string, prefix: string) => {
              for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
                if (entry.isDirectory()) copyHDL(path.join(folder, entry.name), `${prefix}${entry.name}/`);
                // Preserve pinned third-party bytes, including loaders and notices.
                else compilation.emitAsset(`${prefix}${entry.name}`, new webpack.sources.RawSource(fs.readFileSync(path.join(folder, entry.name))), { minimized: true });
              }
            };
            copyHDL(hdl, 'hdl/');
            for (const asset of collectTikZAssets()) compilation.emitAsset(asset.name, new webpack.sources.RawSource(fs.readFileSync(asset.file)));
            for (const [packageName, license] of [
              ['citeproc', 'LICENSE'],
              ['@citation-js/core', 'LICENSE.md'],
              ['@citation-js/plugin-bibtex', 'LICENSE.md'],
              ['@citation-js/plugin-csl', 'LICENSE.md'],
            ]) {
              const filename = path.join(directory, 'node_modules', packageName!, license!);
              compilation.emitAsset(`citations/licenses/${packageName!.replace('@', '').replace('/', '-')}-${license}`, new webpack.sources.RawSource(fs.readFileSync(filename)));
            }
            for (const [packageName, asset] of [
              ['netlistsvg', 'netlistsvg'],
              ['netlistsvg/node_modules/elkjs', 'elkjs'],
            ]) {
              const filename = path.join(directory, 'node_modules', packageName!, 'LICENSE');
              compilation.emitAsset(`netlist/licenses/${asset}-LICENSE`, new webpack.sources.RawSource(fs.readFileSync(filename)));
            }
          });
        });
      },
    },
  ],
});
