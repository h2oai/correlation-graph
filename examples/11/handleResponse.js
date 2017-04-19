function handleResponse(error, response) {
  console.log('arguments from handleResponse', arguments);
  if (error) console.error(error);
  const parsedResponse = parseResponse(response);
  const data = parsedResponse;

  //
  // draw correlation graph
  //
  const correlationGraphProps = {
    selector: '.graph-container',
    data,
    options: { 
      fixedNodeSize: undefined
    }
  }
  window.correlationGraph(correlationGraphProps);
  //
  // draw pictogram table
  //
  const pictogramTableProps = {
    selector: '.table-container',
    data,
    options: {
      topN: 33,
      linksVariable: 'edges',
      valueVariable: 'weight',
      sourceVariable: 'source',
      targetVariable: 'target',
      valueVariableHeader: 'correlation',
      sourceVariableLabel: 'sourceName',
      targetVariableLabel: 'targetName'
    }
  }
  drawPictogramTable(pictogramTableProps);
}