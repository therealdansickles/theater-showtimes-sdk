import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const packageJson = require('./package.json');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

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

// TypeScript plugin configurations
const typescriptConfig = (outputDir = 'dist') => typescript({
  tsconfig: './tsconfig.json',
  exclude: ['**/*.test.*', '**/*.stories.*', '**/examples/**'],
  declarationDir: outputDir,
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
configs.push(defineConfig({
  input: 'src/index.ts',
  output: createOutput(packageJson.main, 'cjs'),
  plugins: [
    ...commonPlugins,
    typescriptConfig(),
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
}));

// 2. ES Module build (Modern bundlers)
configs.push(defineConfig({
  input: 'src/index.ts',
  output: createOutput(packageJson.module, 'esm'),
  plugins: [
    ...commonPlugins,
    typescriptConfig(),
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
}));

// 3. UMD build (Browser global)
configs.push(defineConfig({
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
    typescriptConfig(),
    isProduction && terser({
      compress: {
        drop_console: true,
      },
    }),
  ].filter(Boolean),
  external,
}));

// 4. React-specific build (for React applications)
configs.push(defineConfig({
  input: 'src/react/index.ts',
  output: createOutput('dist/react.js', 'esm'),
  plugins: [
    ...commonPlugins,
    typescriptConfig('dist/react'),
    isProduction && terser(),
  ].filter(Boolean),
  external,
}));

// 5. React Native build (for mobile applications)
configs.push(defineConfig({
  input: 'src/react-native/index.ts',
  output: createOutput('dist/react-native.js', 'esm'),
  plugins: [
    ...commonPlugins,
    typescriptConfig('dist/react-native'),
    // Don't minify React Native builds to preserve debugging
    copy({
      targets: [
        {
          src: 'src/react-native/**/*.tsx',
          dest: 'dist/react-native/src',
        },
      ],
    }),
  ].filter(Boolean),
  external: [...external, 'react-native'],
}));

// 6. Standalone utilities build (for custom integrations)
configs.push(defineConfig({
  input: 'src/utils/index.ts',
  output: createOutput('dist/utils.js', 'esm'),
  plugins: [
    ...commonPlugins,
    typescriptConfig('dist/utils'),
    isProduction && terser(),
  ].filter(Boolean),
  external: [],
}));

// 7. Development build with examples (only in dev mode)
if (isDevelopment) {
  configs.push(defineConfig({
    input: 'examples/react-example/src/index.js',
    output: createOutput('dist/examples/react-example.js', 'esm'),
    plugins: [
      ...commonPlugins,
      copy({
        targets: [
          {
            src: 'examples/**/*',
            dest: 'dist/examples',
          },
        ],
      }),
    ],
    external,
  }));
}

export default configs;