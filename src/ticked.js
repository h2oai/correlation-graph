export default function ticked(
  link,
  soloNodesIds,
  textMainGray,
  color,
  communities,
  nodeG,
  backgroundNode,
  node
) {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
    .style('stroke', (d, i) => {
      if (soloNodesIds.indexOf(d.source.id) === -1) {
        return textMainGray;
      }
      return color(communities[d.source.id]);
    });
    // .style('stroke-opacity', 0.4);

  nodeG
    .attr('transform', d => `translate(${d.x},${d.y})`);

  backgroundNode
    .style('fill', 'white')
    .style('fill-opacity', 1);

  node
    .style('fill', (d, i) => {
      if (soloNodesIds.indexOf(d.id) === -1) {
        return textMainGray;
      }
      return color(communities[d.id]);
    })
    .style('fill-opacity', 0.4)
    .style('stroke', 'white')
    .style('stroke-width', '2px');
}
