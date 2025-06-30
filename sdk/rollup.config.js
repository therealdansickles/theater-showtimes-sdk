import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const packageJson = require('./package.json');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Base external dependencies
const external = ['react', 'react-dom', 'react-native', 'framer-motion', 'axios'];

// Common plugins for all builds
const commonPlugins = [
  peerDepsExternal(),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs({
    include: /node_modules/,
  }),
  postcss({
    extract: true,
    minimize: isProduction,
    sourceMap: true,
  }),
];

// TypeScript plugin configuration
const typescriptConfig = typescript({
  tsconfig: './tsconfig.json',
  exclude: ['**/*.test.*', '**/*.stories.*', '**/examples/**'],
});

// Base output configuration
const createOutput = (file, format, options = {}) => ({
  file,
  format,
  sourcemap: true,
  exports: 'named',
  ...options,
});

// Main configuration for multiple builds
const configs = [];

// 1. CommonJS build (Node.js environments)
configs.push({
  input: 'src/index.ts',
  output: createOutput(packageJson.main, 'cjs'),
  plugins: [
    ...commonPlugins,
    typescriptConfig,
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
});

// 2. ES Module build (Modern bundlers)
configs.push({
  input: 'src/index.ts',
  output: createOutput(packageJson.module, 'esm'),
  plugins: [
    ...commonPlugins,
    typescriptConfig,
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
});

// 3. UMD build (Browser global)
configs.push({
  input: 'src/index.ts',
  output: createOutput('dist/index.umd.js', 'umd', {
    name: 'MovieBookingSDK',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'framer-motion': 'FramerMotion',
      axios: 'axios',
    },
  }),
  plugins: [
    ...commonPlugins,
    typescriptConfig,
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
});

export default configs;