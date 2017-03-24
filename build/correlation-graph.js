(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.correlationGraph = factory());
}(this, (function () { 'use strict';

function ticked(link, soloNodesIds, textMainGray, color, communities, nodeG, backgroundNode, node) {
  link.attr('x1', function (d) {
    return d.source.x;
  }).attr('y1', function (d) {
    return d.source.y;
  }).attr('x2', function (d) {
    return d.target.x;
  }).attr('y2', function (d) {
    return d.target.y;
  }).style('stroke', function (d, i) {
    if (soloNodesIds.indexOf(d.source.id) === -1) {
      return textMainGray;
    }
    return color(communities[d.source.id]);
  });
  // .style('stroke-opacity', 0.4);

  nodeG.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });

  backgroundNode.style('fill', 'white').style('fill-opacity', 1);

  node.style('fill', function (d, i) {
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

function render(props) {
  //
  // configuration
  //

  var selector = props.selector;
  var inputData = props.data;
  var options = props.options;

  var width = 960; // window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var height = 600; // window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  var linkWeightThreshold = 0.79;
  var soloNodeLinkWeightThreshold = 0.1;
  var labelTextScalingFactor = 28;

  // separation between same-color circles
  var padding = 9; // 1.5

  // separation between different-color circles
  var clusterPadding = 48; // 6

  var maxRadius = 12;

  var z = d3.scaleOrdinal(d3.schemeCategory20);

  // determines if nodes and node labels size is fixed 
  // defaults to `undefined`
  var fixedNodeSize = options.fixedNodeSize;
  var defaultNodeRadius = '9px';

  //
  //
  //

  var svg = d3.select(selector).append('svg').attr('width', width).attr('height', height);

  var backgroundRect = svg.append('rect').attr('width', width).attr('height', height).classed('background', true).style('fill', 'white');

  var linkWidthScale = d3.scalePow().exponent(2).domain([0, 1]).range([0, 5]);

  // http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12
  var boldAlternating12 = ['#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', '#b15928', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'];

  var gephiSoftColors = ['#81e2ff', // light blue
  '#b9e080', // light green
  '#ffaac2', // pink
  '#ffc482', // soft orange
  '#efc4ff', // soft violet
  '#a6a39f', // smoke gray
  '#80deca', // teal
  '#e9d9d8' // pink gray
  ];

  var textMainGray = '#635F5D';

  var color = d3.scaleOrdinal().range(boldAlternating12);

  //
  // data-driven code starts here
  //

  var graph = inputData;
  var nodes = _.cloneDeep(graph.nodes);
  var links = _.cloneDeep(graph.edges);

  // total number of nodes
  var n = nodes.length;

  var staticLinks = graph.edges;
  var linksAboveThreshold = [];
  staticLinks.forEach(function (d) {
    if (d.weight > linkWeightThreshold) {
      linksAboveThreshold.push(d);
    }
  });
  var linksForCommunityDetection = linksAboveThreshold;

  var nodesAboveThresholdSet = d3.set();
  linksAboveThreshold.forEach(function (d) {
    nodesAboveThresholdSet.add(d.source);
    nodesAboveThresholdSet.add(d.target);
  });
  var nodesAboveThresholdIds = nodesAboveThresholdSet.values().map(function (d) {
    return Number(d);
  });
  var nodesForCommunityDetection = nodesAboveThresholdIds;

  //
  // manage threshold for solo nodes
  //

  var linksAboveSoloNodeThreshold = [];
  staticLinks.forEach(function (d) {
    if (d.weight > soloNodeLinkWeightThreshold) {
      linksAboveSoloNodeThreshold.push(d);
    }
  });
  var nodesAboveSoloNodeThresholdSet = d3.set();
  linksAboveSoloNodeThreshold.forEach(function (d) {
    nodesAboveSoloNodeThresholdSet.add(d.source);
    nodesAboveSoloNodeThresholdSet.add(d.target);
  });
  var soloNodesIds = nodesAboveSoloNodeThresholdSet.values().map(function (d) {
    return Number(d);
  });

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

  nodes.forEach(function (d) {
    d.inDegree = 0;
    d.outDegree = 0;
  });
  links.forEach(function (d) {
    nodes[d.source].outDegree += 1;
    nodes[d.target].inDegree += 1;
  });

  //
  // calculate the linkWeightSums for each node
  // 
  nodes.forEach(function (d) {
    d.linkWeightSum = 0;
  });
  links.forEach(function (d) {
    nodes[d.source].linkWeightSum += d.weight;
    nodes[d.target].linkWeightSum += d.weight;
  });

  //
  // detect commnunities
  //

  var communityFunction = jLouvain().nodes(nodesForCommunityDetection).edges(linksForCommunityDetection);

  var communities = communityFunction();
  console.log('clusters (communities) detected by jLouvain', communities);

  //
  // add community and radius properties to each node
  //

  var defaultRadius = 10;
  nodes.forEach(function (node) {
    node.r = defaultRadius;
    node.cluster = communities[node.id];
  });

  //
  // collect clusters from nodes
  //

  var clusters = {};
  nodes.forEach(function (node) {
    var radius = node.r;
    var clusterID = node.cluster;
    if (!clusters[clusterID] || radius > clusters[clusterID].r) {
      clusters[clusterID] = node;
    }
  });
  console.log('clusters', clusters);

  //
  // now we draw elements on the page
  //

  var link = svg.append('g').style('stroke', '#aaa').selectAll('line').data(links).enter().append('line').style('stroke-width', function (d) {
    return linkWidthScale(d.weight);
  }).style('stroke-opacity', 0.4);

  link.attr('class', 'link').attr('marker-end', 'url(#end-arrow)');

  var nodesParentG = svg.append('g').attr('class', 'nodes');

  var node = nodesParentG.selectAll('.node').data(nodes).enter().append('g').classed('node', true).attr('id', function (d) {
    return 'node' + d.id;
  });

  var nodeRadiusScale = d3.scaleLinear().domain([0, nodes.length]).range([5, 30]);

  var backgroundNode = node.append('circle').attr('r', function (d) {
    if (typeof fixedNodeSize !== 'undefined') {
      return defaultRadius + 'px';
    }
    // return `${nodeRadiusScale(d.inDegree)}px`
    return nodeRadiusScale(d.linkWeightSum) + 'px';
  }).classed('background', true);

  var nodeCircle = node.append('circle').attr('r', function (d) {
    if (typeof fixedNodeSize !== 'undefined') {
      return defaultRadius + 'px';
    }
    // return `${nodeRadiusScale(d.inDegree)}px`
    return nodeRadiusScale(d.linkWeightSum) + 'px';
  }).on('mouseover', fade(0.1))
  // .on('mouseout', fade(0.4))
  .classed('mark', true);

  // draw labels
  var label = node.append('text').text(function (d) {
    return d.name;
  }).style('font-size', function (d) {
    if (typeof fixedNodeSize !== 'undefined') {
      return defaultRadius * 1 + 'px';
    }
    return Math.max(Math.min(2 * nodeRadiusScale(d.linkWeightSum), (2 * nodeRadiusScale(d.linkWeightSum) - 8) / this.getComputedTextLength() * labelTextScalingFactor),
    // Math.min(
    //   2 * nodeRadiusScale(d.inDegree),
    //   (2 * nodeRadiusScale(d.inDegree) - 8) / this.getComputedTextLength() * labelTextScalingFactor
    // ),
    8) + 'px';
  }).style('fill', '#666').style('fill-opacity', 1).style('pointer-events', 'none').style('stroke', 'none').attr('class', 'label').attr('dx', function (d) {
    var dxValue = -1 * (this.getComputedTextLength() / 2) + 'px';
    return dxValue;
  }).attr('dy', '.35em');

  var linkedByIndex = {};
  linksAboveSoloNodeThreshold.forEach(function (d) {
    // console.log('d from linkedByIndex creation', d);
    linkedByIndex[d.source + ',' + d.target] = true;
  });
  console.log('linkedByIndex', linkedByIndex);

  // click on the background to reset the fade
  // to show all nodes
  backgroundRect.on('click', resetFade());

  var boundTicked = ticked.bind(this, link, soloNodesIds, textMainGray, color, communities, node, backgroundNode, node);

  var simulation = d3.forceSimulation().nodes(nodes).force('link', d3.forceLink().id(function (d) {
    return d.id;
  })).velocityDecay(0.2).force('x', d3.forceX().strength(0.0005)).force('y', d3.forceY().strength(0.0005)).force('collide', collide).force('cluster', clustering).force('charge', d3.forceManyBody().strength(-1200)).force('center', d3.forceCenter(width / 2, height / 2)).on('tick', boundTicked);

  simulation.force('link').links(links);

  var boundDragstarted = dragstarted.bind(this, simulation);
  var boundDragended = dragended.bind(this, simulation);

  node.call(d3.drag().on('start', boundDragstarted).on('drag', dragged).on('end', boundDragended));

  //
  // implement custom forces for clustering communities
  //

  function clustering(alpha) {
    nodes.forEach(function (d) {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x;
      var y = d.y - cluster.y;
      var l = Math.sqrt(x * x + y * y);
      var r = d.r + cluster.r;
      if (l !== r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    });
  }

  function collide(alpha) {
    var quadtree = d3.quadtree().x(function (d) {
      return d.x;
    }).y(function (d) {
      return d.y;
    }).addAll(nodes);

    nodes.forEach(function (d) {
      var r = d.r + maxRadius + Math.max(padding, clusterPadding);
      var nx1 = d.x - r;
      var nx2 = d.x + r;
      var ny1 = d.y - r;
      var ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.data && quad.data !== d) {
          var x = d.x - quad.data.x;
          var y = d.y - quad.data.y;
          var l = Math.sqrt(x * x + y * y);
          var _r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
          if (l < _r) {
            l = (l - _r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.data.x += x;
            quad.data.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  }

  //
  //
  //

  function isConnected(a, b) {
    return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index === b.index;
  }

  function isConnectedAsSource(a, b) {
    return linkedByIndex[a.index + ',' + b.index];
  }

  function isConnectedAsTarget(a, b) {
    return linkedByIndex[b.index + ',' + a.index];
  }

  function fade(opacity) {
    return function (d) {
      node.style('stroke-opacity', function (o) {
        // console.log('o from fade node.style', o);
        // console.log('isConnected(d, o)', isConnected(d, o));
        // const thisOpacity = isConnected(d, o) ? defaultOpacity : opacity;
        // console.log('thisOpacity from fade node.style', thisOpacity);
        // console.log('this from fade node.style', this);

        // style the mark circle
        // console.log('this.id', this.id);
        // this.setAttribute('fill-opacity', thisOpacity);
        var defaultMarkOpacity = 0.4;
        d3.select('#' + this.id).selectAll('.mark').style('fill-opacity', function (p) {
          // console.log('p from fade mark', p);
          // console.log('isConnected(d, p) mark', isConnected(d, p));
          var markOpacity = isConnected(d, p) ? defaultMarkOpacity : opacity;
          // console.log('markOpacity', markOpacity);
          return markOpacity;
        });

        // style the label text
        var defaultLabelOpacity = 1;
        d3.select('#' + this.id).selectAll('.label').style('fill-opacity', function (p) {
          // console.log('p from fade label', p);
          // console.log('isConnected(d, p) label', isConnected(d, p));
          var labelOpacity = 1;
          if (!isConnected(d, p) && opacity !== defaultMarkOpacity) {
            labelOpacity = opacity;
          }
          // console.log('labelOpacity', labelOpacity);
          return labelOpacity;
        });

        return 1;
      });

      // style the link lines
      var defaultLinkOpacity = 0.4;
      link.style('stroke-opacity', function (o) {
        // console.log('o from fade link style', o);
        // console.log('d from fade link style', d);
        if (o.source.id === d.id || o.target.id === d.id) {
          return defaultLinkOpacity;
        }
        return opacity;
      });
      link.attr('marker-end', function (o) {
        if (opacity === defaultLinkOpacity || o.source.id === d.id || o.target.id === d.id) {
          return 'url(#end-arrow)';
        }
        return 'url(#end-arrow-fade)';
      });
    };
  }

  function resetFade() {
    return function () {
      console.log('resetFade function was called');
      // reset marks
      var defaultMarkOpacity = 0.4;
      d3.select(selector).selectAll('.mark').style('fill-opacity', defaultMarkOpacity);

      // reset labels
      var defaultLabelOpacity = 1;
      d3.select(selector).selectAll('.label').style('fill-opacity', defaultLabelOpacity);

      // reset links
      var defaultLinkOpacity = 0.4;
      d3.select(selector).selectAll('.link').style('stroke-opacity', defaultLinkOpacity);
    };
  }
}

/* global d3 _ jLouvain window document */
/* eslint-disable newline-per-chained-call */
var index = function (selector, inputData, options) {
  render(selector, inputData, options);
};

return index;

})));
