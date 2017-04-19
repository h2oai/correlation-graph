function parseResponse(response) {
  console.log('arguments from parseResponse', arguments);
  const responseData = response;
  const inputData = responseData;

  const graph = {};
  graph.nodes = [];
  graph.edges = [];

  inputData[0].nodes.forEach((d, i) => {
    graph.nodes.push({
      "id": i,
      "name": d
    })
  })

  inputData[0].edges.forEach((d, i) => {
    graph.edges.push({
      "source": d[0],
      "target": d[1],
      "weight": inputData[0].weights[i]
    })
  })

  const parsedData = graph;
  // console.log('parsedData', parsedData);
  return parsedData;
}