import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import strip from 'rollup-plugin-strip';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {},
  moduleName: 'correlationGraph',
  globals: {
    d3: 'd3',
    lodash: '_'
  },
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    json(),
    babel(),
    commonjs()// ,
    // strip({
    //   // set this to `false` if you don't want to
    //   // remove debugger statements
    //   debugger: true,
    //   // defaults to `[ 'console.*', 'assert.*']`
    //   functions: [ 'console.log', 'assert.*', 'debug'],
    //   // set this to `false` if you're not using sourcemaps –
    //   // defaults to `true`
    //   sourceMap: false
    // })
  ],
  external: [],
  dest: 'build/correlation-graph.js',
  acorn: {
    allowReserved: true
  }//,
  //sourceMap: true,
  //sourceMapFile: 'build/correlation-graph.js'
};