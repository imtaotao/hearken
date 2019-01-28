const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cleanup = require('rollup-plugin-cleanup')
const resolve = require('rollup-plugin-node-resolve')
const cmd = require('rollup-plugin-commonjs')

const esm = {
  input: 'src/index.js',
  output: {
    file: 'dist/hearken.esm.js',
    format: 'es',
  }
}

const umd = {
  input: 'src/index.js',
  output: {
    file: 'dist/hearken.min.js',
    format: 'umd',
    name: 'Grass',
  }
}

const cjs = {
  input: 'src/index.js',
  output: {
    file: 'dist/hearken.common.js',
    format: 'cjs',
  }
}

async function build (cfg) {
  const bundle = await rollup.rollup({
    input: cfg.input,
    plugins: [
      cleanup(),
      resolve(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        babelrc: true,
      }),
      cmd(),
    ]
  })
  await bundle.generate(cfg.output)
  await bundle.write(cfg.output)
}

build(esm)
build(cjs)
build(umd)