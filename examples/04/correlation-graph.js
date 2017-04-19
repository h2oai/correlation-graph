/* global d3 window document */
/* eslint-disable newline-per-chained-call */

const width = 960; // window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
const height = 600; // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

const simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-1000))
  .force('center', d3.forceCenter(width / 2, height / 2));

const nodeRadius = '9px';
const linkWidthScale = d3.scaleLinear()
  .domain([0, 1])
  .range([0, 5]);

const networkGraphColors = [
  '#254E00',
  '#144847',
  '#137B80',
  '#193556',
  '#5F7186',
  '#842854',
  '#6D191B',
  '#8C3B00',
  '#BA5F06',
  '#B08B12',
  '#5C8100',
  '#6BBBA1',
  '#0F8C79',
  '#42A5B3',
  '#6B99A1',
  '#8E6C8A',
  '#D15A86',
  '#BD2D28',
  '#E58429',
  '#E3BA22',
  '#A0B700',
  '#C8D7A1',
  '#7ABFCC',
  '#33B6D0',
  '#B0CBDB',
  '#B396AD',
  '#DCBDCF',
  '#E25A42',
  '#F6B656',
  '#F2DA57'
];

const color = d3.scaleOrdinal()
  .range(networkGraphColors);

d3.queue()
  .defer(d3.json, 'graph.json')
  // .defer(d3.csv, 'graphdata.csv')
  .await(analyze);

function analyze(error, graph) {
  if (error) throw error;

  const nodes = graph.nodes;
  const links = graph.edges;

  const link = svg.append('g')
    .style('stroke', '#aaa')
    .selectAll('line')
      .data(links)
      .enter().append('line')
      .style('stroke-width', d => linkWidthScale(d.weight));


  const nodesParentG = svg.append('g')
    .attr('class', 'nodes');

  const nodeG = nodesParentG
    .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

  const backgroundNode = nodeG
    .append('circle')
      .attr('r', nodeRadius)
      .classed('background', true);

  const node = nodeG
    .append('circle')
      .attr('r', nodeRadius)
      .classed('mark', true);

  node
    .data(nodes)
    .append('title')
      .text(d => d.name);

  const label = svg.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(nodes)
    .enter().append('title')
      .attr('class', 'label')
      .text(d => d.name)
      .style('fill', '#666')
      .style('font-size', 2);

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
      .style('stroke-opacity', 0.4);

    backgroundNode
      .style('fill', 'white')
      .style('fill-opacity', 1)
      .attr('cx', d => d.x + 2)
      .attr('cy', d => d.y - 2);

    node
      .style('fill', (d, i) => color(i))
      .style('fill-opacity', 0.4)
      .attr('cx', d => d.x + 2)
      .attr('cy', d => d.y - 2);

    label
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  }
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}
