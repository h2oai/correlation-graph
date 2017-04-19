function handleResponse(error, response) {
  console.log('arguments from handleResponse', arguments);
  if (error) console.error(error);
  const parsedResponse = parseResponse(response);
  const props = {
    selector,
    data: parsedResponse,
    options: { 
      fixedNodeSize: undefined
    }
  }
  window.correlationGraph(props);
}