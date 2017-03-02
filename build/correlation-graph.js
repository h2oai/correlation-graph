(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.correlationGraph = factory());
}(this, (function () { 'use strict';

function ticked(link, soloNodesIds, textMainGray, color, communities, nodeG, backgroundNode, node) {
  link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).style('stroke', (d, i) => {
    if (soloNodesIds.indexOf(d.source.id) === -1) {
      return textMainGray;
    }
    return color(communities[d.source.id]);
  }).style('stroke-opacity', 0.4);

  nodeG.attr('transform', d => `translate(${d.x},${d.y})`);

  backgroundNode.style('fill', 'white').style('fill-opacity', 1);

  node.style('fill', (d, i) => {
    if (soloNodesIds.indexOf(d.id) === -1) {
      return textMainGray;
    }
    return color(communities[d.id]);
  }).style('fill-opacity', 0.4).style('stroke', 'white').style('stroke-width', '2px');
}

/* global d3 */

function dragstarted(simulation) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

/* global d3 */

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

/* global d3 */

function dragended(simulation) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */
var index = function () {
  const width = 960; // window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = 600; // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const linkWeightThreshold = 0.79;
  const soloNodeLinkWeightThreshold = 0.1;
  const labelTextScalingFactor = 28;

  const svg = d3.select('body').append('svg').attr('width', width).attr('height', height);

  const simulation = d3.forceSimulation().force('link', d3.forceLink().id(d => d.id)).force('charge', d3.forceManyBody().strength(-1000)).force('center', d3.forceCenter(width / 2, height / 2));

  const defaultNodeRadius = '9px';

  const linkWidthScale = d3.scalePow().exponent(2).domain([0, 1]).range([0, 5]);

  // http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12
  const boldAlternating12 = ['#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', '#b15928', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'];

  const textMainGray = '#635F5D';

  const color = d3.scaleOrdinal().range(boldAlternating12);

  d3.queue().defer(d3.json, 'graph.json').await(analyze);

  function analyze(error, graph) {
    if (error) throw error;

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
    const nodesAboveThresholdIds = nodesAboveThresholdSet.values().map(d => Number(d));
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
    const soloNodesIds = nodesAboveSoloNodeThresholdSet.values().map(d => Number(d));
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

    const communityFunction = jLouvain().nodes(nodesForCommunityDetection).edges(linksForCommunityDetection);

    const communities = communityFunction();
    console.log('communities from jLouvain', communities);

    //
    // now we draw elements on the page
    //

    const link = svg.append('g').style('stroke', '#aaa').selectAll('line').data(links).enter().append('line').style('stroke-width', d => linkWidthScale(d.weight));

    const nodesParentG = svg.append('g').attr('class', 'nodes');

    const boundDragstarted = dragstarted.bind(this, simulation);
    const boundDragended = dragended.bind(this, simulation);

    const nodeG = nodesParentG.selectAll('g').data(nodes).enter().append('g').call(d3.drag().on('start', boundDragstarted).on('drag', dragged).on('end', boundDragended));

    const nodeRadiusScale = d3.scaleLinear().domain([0, nodes.length]).range([5, 30]);

    const backgroundNode = nodeG.append('circle').attr('r', d => `${nodeRadiusScale(d.inDegree)}px`).classed('background', true);

    const node = nodeG.append('circle').attr('r', d => `${nodeRadiusScale(d.inDegree)}px`).classed('mark', true);

    node.data(nodes).append('title').text(d => d.name);

    const label = nodeG.append('text').text(d => d.name).style('font-size', function (d) {
      console.log('d from node label', d);
      return `${Math.max(Math.min(2 * nodeRadiusScale(d.inDegree), (2 * nodeRadiusScale(d.inDegree) - 8) / this.getComputedTextLength() * labelTextScalingFactor), 8)}px`;
    }).style('fill', '#666').attr('class', 'label').attr('dx', function (d) {
      const dxValue = `${-1 * (this.getComputedTextLength() / 2)}px`;
      console.log('dxValue', dxValue);
      return dxValue;
    }).attr('dy', '.35em');

    const toolTip = svg.append('g').attr('class', 'toolTips').selectAll('text').data(nodes).enter().append('title').attr('class', 'label').style('fill', '#666').style('font-size', 20).text(d => d.name);

    const boundTicked = ticked.bind(this, link, soloNodesIds, textMainGray, color, communities, nodeG, backgroundNode, node);

    simulation.nodes(nodes).on('tick', boundTicked);

    simulation.force('link').links(links);
  }
};

return index;

})));
