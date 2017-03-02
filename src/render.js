/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */

import ticked from './ticked';
import dragstarted from './dragstarted';
import dragged from './dragged';
import dragended from './dragended';

export default function render(selector, inputData, options) {
  const width = 960; // window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = 600; // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const linkWeightThreshold = 0.79;
  const soloNodeLinkWeightThreshold = 0.1;
  const labelTextScalingFactor = 28;

  const svg = d3.select(selector).append('svg')
    .attr('width', width)
    .attr('height', height);

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const defaultNodeRadius = '9px';

  const linkWidthScale = d3.scalePow()
    .exponent(2)
    .domain([0, 1])
    .range([0, 5]);

  // http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12
  const boldAlternating12 = [
    '#1f78b4',
    '#33a02c',
    '#e31a1c',
    '#ff7f00',
    '#6a3d9a',
    '#b15928',
    '#a6cee3',
    '#b2df8a',
    '#fb9a99',
    '#fdbf6f',
    '#cab2d6',
    '#ffff99',
  ];

  const textMainGray = '#635F5D';

  const color = d3.scaleOrdinal()
    .range(boldAlternating12);

  //
  // data-driven code starts here
  //

  const graph = inputData;
  const nodes = _.cloneDeep(graph.nodes);
  const links = _.cloneDeep(graph.edges);

  const staticLinks = graph.edges;
  const linksAboveThreshold = [];
  staticLinks.forEach(d => {
    if (d.weight > linkWeightThreshold) {
      linksAboveThreshold.push(d);
    }
  });
  const linksForCommunityDetection = linksAboveThreshold;

  const nodesAboveThresholdSet = d3.set();
  linksAboveThreshold.forEach(d => {
    nodesAboveThresholdSet.add(d.source);
    nodesAboveThresholdSet.add(d.target);
  });
  const nodesAboveThresholdIds = nodesAboveThresholdSet
    .values()
    .map(d => Number(d));
  const nodesForCommunityDetection = nodesAboveThresholdIds;

  //
  // manage threshold for solo nodes
  //
  const linksAboveSoloNodeThreshold = [];
  staticLinks.forEach(d => {
    if (d.weight > soloNodeLinkWeightThreshold) {
      linksAboveSoloNodeThreshold.push(d);
    }
  });
  const nodesAboveSoloNodeThresholdSet = d3.set();
  linksAboveSoloNodeThreshold.forEach(d => {
    nodesAboveSoloNodeThresholdSet.add(d.source);
    nodesAboveSoloNodeThresholdSet.add(d.target);
  });
  const soloNodesIds = nodesAboveSoloNodeThresholdSet
    .values()
    .map(d => Number(d));
  //
  //
  //

  console.log('nodes', nodes);
  console.log('nodesAboveThresholdIds', nodesAboveThresholdIds);
  console.log('nodesForCommunityDetection', nodesForCommunityDetection);
  console.log('staticLinks', staticLinks);
  console.log('linksAboveThreshold', linksAboveThreshold);
  console.log('linksForCommunityDetection', linksForCommunityDetection);

  //
  // calculate degree for each node
  // where `degree` is the number of links
  // that a node has
  //
  nodes.forEach(d => {
    d.inDegree = 0;
    d.outDegree = 0;
  });
  links.forEach(d => {
    nodes[d.source].outDegree += 1;
    nodes[d.target].inDegree += 1;
  });
  //
  //
  //

  const communityFunction = jLouvain()
    .nodes(nodesForCommunityDetection)
    .edges(linksForCommunityDetection);

  const communities = communityFunction();
  console.log('communities from jLouvain', communities);

  //
  // now we draw elements on the page
  //

  const link = svg.append('g')
    .style('stroke', '#aaa')
    .selectAll('line')
      .data(links)
      .enter().append('line')
      .style('stroke-width', d => linkWidthScale(d.weight));


  const nodesParentG = svg.append('g')
    .attr('class', 'nodes');

  const boundDragstarted = dragstarted.bind(this, simulation);
  const boundDragended = dragended.bind(this, simulation);

  const nodeG = nodesParentG
    .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', boundDragstarted)
        .on('drag', dragged)
        .on('end', boundDragended)
      );

  const nodeRadiusScale = d3.scaleLinear()
    .domain([0, nodes.length])
    .range([5, 30]);

  const backgroundNode = nodeG
    .append('circle')
      .attr('r', d => `${nodeRadiusScale(d.inDegree)}px`)
      .classed('background', true);

  const node = nodeG
    .append('circle')
      .attr('r', d => `${nodeRadiusScale(d.inDegree)}px`)
      .classed('mark', true);

  node
    .data(nodes)
    .append('title')
      .text(d => d.name);


  const label = nodeG.append('text')
    .text(d => d.name)
    .style('font-size', function (d) {
      console.log('d from node label', d);
      return `${
        Math.max(
          Math.min(
            2 * nodeRadiusScale(d.inDegree),
            (2 * nodeRadiusScale(d.inDegree) - 8) / this.getComputedTextLength() * labelTextScalingFactor
          ),
          8
        )
      }px`;
    })
    .style('fill', '#666')
    .attr('class', 'label')
    .attr('dx', function (d) {
      const dxValue = `${-1 * (this.getComputedTextLength() / 2)}px`;
      console.log('dxValue', dxValue);
      return dxValue;
    })
    .attr('dy', '.35em');

  const toolTip = svg.append('g')
    .attr('class', 'toolTips')
    .selectAll('text')
    .data(nodes)
    .enter().append('title')
      .attr('class', 'label')
      .style('fill', '#666')
      .style('font-size', 20)
      .text(d => d.name);

  const boundTicked = ticked.bind(
    this,
    link,
    soloNodesIds,
    textMainGray,
    color,
    communities,
    nodeG,
    backgroundNode,
    node
  );

  simulation
    .nodes(nodes)
    .on('tick', boundTicked);

  simulation.force('link')
    .links(links);
}
