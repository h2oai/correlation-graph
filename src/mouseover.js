/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */

export default function mouseover() {
  const currentNodeId = d3.select(this).attr('id');
  // console.log('currentNodeId', currentNodeId);

  const gSelection = d3.selectAll('g')
    .filter((d, i, nodes) => {
      // console.log('this from mouseover filter', this);
      // console.log('nodes[i].id', nodes[i].id);
      // console.log('currentNodeId', currentNodeId);
      return nodes[i].id !== currentNodeId;
    });

  gSelection
    .select('.mark')
    .style('fill-opacity', 0.1);

  gSelection
    .select('text')
    .style('opacity', 0.1);
}