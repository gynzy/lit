import filesize from 'rollup-plugin-filesize';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    // Build without polyfills.
    input: 'lit-virtualizer.js',
    output: {
      file: 'lit-virtualizer.bundled.js',
      format: 'esm',
    },
    inlineDynamicImports: true,
    external: [
      'lit-html',
      'lit-element',
      'resize-observer-polyfill',
      'event-target-shim',
    ],
    plugins: [
      terser({
        warnings: true,
        module: true,
      }),
      filesize({
        showBrotliSize: true,
      }),
    ],
  },
  {
    // Build with polyfills resolved and included.
    input: 'lit-virtualizer.js',
    output: {
      file: 'lit-virtualizer-with-polyfills.bundled.js',
      format: 'esm',
    },
    inlineDynamicImports: true,
    external: ['lit-html', 'lit-element'],
    plugins: [
      terser({
        warnings: true,
        module: true,
      }),
      filesize({
        showBrotliSize: true,
      }),
      resolve(),
    ],
  },
];
