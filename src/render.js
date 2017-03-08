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
/*
  const mouseOverFunction = function (d) {
    const circle = d3.select(this);

    node
      .transition(500)
        // .style('opacity', o => {
        //   const isConnectedValue = isConnected(o, d);
        //   if (isConnectedValue) {
        //     return 1.0;
        //   }
        //   return 0.2
        // })
        .style('fill-opacity', (o) => {
          let opacity;
          if (isConnectedAsTarget(o, d) && isConnectedAsSource(o, d)) {
            opacity = 0.7;
          } else if (isConnectedAsSource(o, d)) {
            opacity = 0.7;
          } else if (isConnectedAsTarget(o, d)) {
            opacity = 0.7;
          } else if (isEqual(o, d)) {
            opacity = 0.7;
          } else {
            opacity = 0.2;
          }
          return opacity;
        });

    link
      .transition(500)
        .style('stroke-opacity', o => (o.source === d || o.target === d ? 0.9 : 0.2))
        .transition(500)
        .attr('marker-end', o => (o.source === d || o.target === d ? 'url(#arrowhead)' : 'url()'));

    // circle
    //   .transition(500)
    //     .attr('r', () => {
    //       console.log('d from mouseover circle radius', d);
    //       return 1.4 * 4;
    //     });
  };

  const mouseOutFunction = function () {
    const circle = d3.select(this);

    node
      .transition(500);

    link
      .transition(500);

    // circle
    //   .transition(500)
    //     .attr('r', 4);
  };
*/

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
  // detect commnunities
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
      .style('stroke-width', d => linkWidthScale(d.weight))
      .style('stroke-opacity', 0.4);

  link
    .attr('class', 'link')
    .attr('marker-end', 'url(#end-arrow)')
    // .on('mouseout', fade(0.4));

  const nodesParentG = svg.append('g')
    .attr('class', 'nodes');

  // const boundMouseover = mouseover.bind(this);
  const boundDragstarted = dragstarted.bind(this, simulation);
  const boundDragended = dragended.bind(this, simulation);

  const node = nodesParentG.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .classed('node', true);

  node
    .attr('id', d => `node${d.id}`)
    .call(d3.drag()
      .on('start', boundDragstarted)
      .on('drag', dragged)
      .on('end', boundDragended)
    );

  const nodeRadiusScale = d3.scaleLinear()
    .domain([0, nodes.length])
    .range([5, 30]);

  const backgroundNode = node
    .append('circle')
      .attr('r', d => `${nodeRadiusScale(d.inDegree)}px`)
      .classed('background', true);

  const nodeCircle = node
    .append('circle')
      .attr('r', d => `${nodeRadiusScale(d.inDegree)}px`)
      .on('mouseover', fade(0.1))
      .on('mouseout', fade(0.4))
      .classed('mark', true);

  // draw SVG title tooltip
  // node
  //   .append('title')
  //     .text(d => d.name);

  // draw labels
  const label = node.append('text')
    .text(d => d.name)
    .style('font-size', function (d) {
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
    .style('fill-opacity', 1)
    .style('pointer-events', 'none')
    .style('stroke', 'none')
    .attr('class', 'label')
    .attr('dx', function (d) {
      const dxValue = `${-1 * (this.getComputedTextLength() / 2)}px`;
      return dxValue;
    })
    .attr('dy', '.35em');

  // const toolTip = svg.append('g')
  //   .attr('class', 'toolTips')
  //   .selectAll('text')
  //   .data(nodes)
  //   .enter().append('title')
  //     .attr('class', 'label')
  //     .style('fill', '#666')
  //     .style('font-size', 20)
  //     .text(d => d.name);

  const boundTicked = ticked.bind(
    this,
    link,
    soloNodesIds,
    textMainGray,
    color,
    communities,
    node,
    backgroundNode,
    node
  );

  simulation
    .nodes(nodes)
    .on('tick', boundTicked);

  simulation.force('link')
    .links(links);

  const linkedByIndex = {};
  linksAboveSoloNodeThreshold.forEach((d) => {
    // console.log('d from linkedByIndex creation', d);
    linkedByIndex[`${d.source},${d.target}`] = true;
  });
  console.log('linkedByIndex', linkedByIndex);

  function isConnected(a, b) {
    return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index === b.index;
  }

  function isConnectedAsSource(a, b) {
    return linkedByIndex[`${a.index},${b.index}`];
  }

  function isConnectedAsTarget(a, b) {
    return linkedByIndex[`${b.index},${a.index}`];
  }

  function isEqual(a, b) {
    return a.index === b.index;
  }

  function fade(opacity) {
    return d => {
      node.style('stroke-opacity', function (o) {
        // console.log('o from fade node.style', o);
        // console.log('isConnected(d, o)', isConnected(d, o));
        // const thisOpacity = isConnected(d, o) ? defaultOpacity : opacity;
        // console.log('thisOpacity from fade node.style', thisOpacity);
        // console.log('this from fade node.style', this);

        // style the mark circle
        // console.log('this.id', this.id);
        // this.setAttribute('fill-opacity', thisOpacity);
        const defaultMarkOpacity = 0.4;
        d3.select(`#${this.id}`).selectAll('.mark')
          .style('fill-opacity', p => {
            // console.log('p from fade mark', p);
            // console.log('isConnected(d, p) mark', isConnected(d, p));
            const markOpacity = isConnected(d, p) ? defaultMarkOpacity : opacity;
            // console.log('markOpacity', markOpacity);
            return markOpacity;
          });

        // style the label text
        const defaultLabelOpacity = 1;
        d3.select(`#${this.id}`).selectAll('.label')
          .style('fill-opacity', p => {
            // console.log('p from fade label', p);
            // console.log('isConnected(d, p) label', isConnected(d, p));
            let labelOpacity = 1;
            if (!isConnected(d, p) && (opacity !== defaultMarkOpacity)) {
              labelOpacity = opacity;
            }
            // console.log('labelOpacity', labelOpacity);
            return labelOpacity;
          });

        return 1;
      });

      const defaultLinkOpacity = 0.4;
      link.style('stroke-opacity', o => {
        // console.log('o from fade link style', o);
        // console.log('d from fade link style', d);
        if (o.source.id === d.id || o.target.id === d.id) {
          return defaultLinkOpacity;
        }
        return opacity;
      });
      link.attr('marker-end', o => {
        if (opacity === defaultLinkOpacity || o.source.id === d.id || o.target.id === d.id) {
          return 'url(#end-arrow)';
        }
        return 'url(#end-arrow-fade)';
      });
    };
  }
}
