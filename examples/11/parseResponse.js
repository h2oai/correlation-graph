function parseResponse(response) {
  console.log('arguments from parseResponse', arguments);
  const responseData = response;
  const inputData = responseData;

  const graph = {};
  graph.nodes = [];
  graph.edges = [];

  inputData.nodes.forEach((d, i) => {
    graph.nodes.push({
      "id": i,
      "name": d
    })
  })

  inputData.edges.forEach((d, i) => {
    graph.edges.push({
      "source": d[0],
      "target": d[1],
      "weight": inputData.edge_weights[i]
    })
  })

  const parsedData = graph;
  // console.log('parsedData', parsedData);
  return parsedData;
}