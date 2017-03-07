/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */

export default function mouseout() {
  const currentNodeId = d3.select(this).attr('id');
  // console.log('currentNodeId', currentNodeId);

  const parentG = d3.select(this).node().parentNode;
  // console.log('parentG from mouseover', parentG);
  const gSelection = d3.select(parentG).selectAll('g')
    .selectAll('.mark')
    .style('fill-opacity', 0.4);

  d3.select(parentG).selectAll('text')
    .style('opacity', 1);
}