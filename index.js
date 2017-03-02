/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */
import render from './src/render';

export default function () {
  d3.queue()
    .defer(d3.json, 'graph.json')
    .await(render);
}
