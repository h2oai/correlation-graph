export default function ticked(
  link,
  soloNodesIds,
  textMainGray,
  color,
  communities,
  nodeG,
  backgroundNode,
  node,
  graph,
  clusters,
  svg
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
    })
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

  // annotations
  // const makeAnnotations = window.makeAnnotations;
/*
  makeAnnotations.annotations()
    .forEach((d, i) => {
      points = graph.nodes
        .filter(d => d.group === groups[i])
        .map(d => ({
          x: d.x,
          y: d.y,
          r: 5
        }));
      circle = d3.packEnclose(points);
      d.position = { 
        x: circle.x, 
        y: circle.y
      };
      d.subject.radius = circle.r + circlePadding;
    });
    makeAnnotations.update();

  // groups that we want to show annotations for
  let groups = Object.keys(clusters);

  let points = groups.map(p => graph.nodes
  .filter(d => d.group === p)
  .map(d => ({
    x: d.x,
    y: d.y,
    r: 5
  })));

  let circle = points.map(p => d3.packEnclose(p));
  const annotations = [{
    note: { 
      label: 'Group 3',
      title: 'Les Mis'
    },
    dy: 93,
    dx: -176,
    x: circle[0].x,
    y: circle[0].y,
    type: d3.annotationCalloutCircle,
    subject: {
      radius: circle[0].r + circlePadding,
      radiusPadding: 10,
    },
  },
  {
    note: { 
      label: 'Group 1',
      title: 'Les Mis'
    },
    dy: 93,
    dx: -176,
    x: circle[1].x,
    y: circle[1].y,
    type: d3.annotationCalloutCircle,
    subject: {
      radius: circle[1].r + 20,
      radiusPadding: 10,
    },
  },
  {
    note: { 
      label: 'Group 8',
      title: 'Les Mis'
    },
    dy: 93,
    dx: 176,
    x: circle[2].x,
    y: circle[2].y,
    type: d3.annotationCalloutCircle,
    subject: {
      radius: circle[2].r + 20,
      radiusPadding: 10,
    },
  },
  ];

  window.makeAnnotations = d3.annotation()
    .annotations(annotations)
    .accessors({ x: d => d.x, y: d => d.y });

  svg.append('g')
    .attr('class', 'annotation-encircle')
    .call(makeAnnotations);

  svg.selectAll('.annotation-subject')
    .style('pointer-events', 'none');
*/
}
