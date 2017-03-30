export default function drawHelpText(props) {
  const selector = props.selector;
  const height = props.height;
  const xOffset = 75;
  const yOffset = height - 10;
  const helpText = `mouse over a node to see it's relationships. click the background to reset.`;
  d3.select(selector).append('g')
    .attr('transform', `translate(${xOffset},${yOffset})`)
    .append('text')
    .style('fill', '#666')
    .style('fill-opacity', 1)
    .style('pointer-events', 'none')
    .style('stroke', 'none')
    .style('font-size', 10)
    .text(helpText);
}