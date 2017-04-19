/* global d3 window document */
/* eslint-disable newline-per-chained-call */

const svg = d3.select('body').append('svg')
  .attr('width', 960)
  .attr('height', 600);

const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-8))
  .force('center', d3.forceCenter(width / 2, height / 2));

const randomSize = d3.randomUniform(5, 10);
const randomThickness = d3.randomUniform(1, 5);

const color = d3.scaleOrdinal().range(['#d7191c', '#f9d057', '#90eb9d', '#f29e2e', '#00ccbc', '#d7191c', '#f0d057']);

d3.queue()
  .defer(d3.csv, 'datalabel.csv')
  .defer(d3.csv, 'graphdata.csv')
  .await(analyze);

function analyze(error, nodes, links) {
  if (error) throw error;

  // graph.links.forEach(function(d){
  //   d.source = d.source_id;
  //   d.target = d.target_id;
  // });

  const linkedNodesIDs = new Set();

  links.forEach((d) => {
    linkedNodesIDs.add(d.source);
    linkedNodesIDs.add(d.target);
  });

  const linkedNodes = [];

  nodes.forEach((d) => {
    if (linkedNodesIDs.has(d.id)) {
      linkedNodes.push(d);
    }
  });

  console.log(linkedNodes);

  const link = svg.append('g')
    .style('stroke', '#aaa')
    .selectAll('line')
      .data(links)
      .enter().append('line')
      .style('stroke-width', () => randomThickness());


  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
      .data(linkedNodes)
      .enter().append('circle')
      .attr('r', () => randomSize())
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

  node
    .data(linkedNodes)
    .append('title')
      .text(d => d.name);

  const label = svg.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(linkedNodes)
    .enter().append('text')
      .attr('class', 'label')
      .text(d => d.name)
      .style('fill', '#666')
      .style('font-size', randomSize());

  simulation
    .nodes(nodes)
    .on('tick', ticked);

  simulation.force('link')
    .links(links);

  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .style('stroke', (d, i) => color(i))
      .style('stroke-opacity', 0.2);

    node
      // .attr('r', randomSize() )
      .style('fill', (d, i) => color(i))
      .style('fill-opacity', 0.5)
      // .style('stroke', function(d, i){ return color(i) })
      // .style('stroke-width', '1px')
      .attr('cx', d => d.x + 2)
      .attr('cy', d => d.y - 2);

    label
      .attr('x', d => d.x)
          .attr('y', d => d.y);
          // .style('fill', '#4393c3');
  }
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  simulation.fix(d);
}

function dragged(d) {
  simulation.fix(d, d3.event.x, d3.event.y);
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  simulation.unfix(d);
}
