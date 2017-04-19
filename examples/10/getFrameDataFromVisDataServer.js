function getFrameDataFromVisDataServer(selector, options) {
  console.log('arguments from getFrameDataFromVisDataServer', arguments);
  const server = options.server;
  const port = options.port;
  const endPoint = options.endPoint;
  const frameID = options.frameID;
  const tunnel = options.tunnel;
  const h2oIP = options.h2oIP;
  const h2oPort = options.h2oPort;

  postURL = `${server}${endPoint}`;

  console.log('postURL', postURL);

  const postData = {
    "graphic": {
        "type": "network",
        "parameters": {
            "matrixType": "data",
            "normalize": true
        }
    },
    "data": {
        "uri": `http://${h2oIP}:${h2oPort}/3/Frames/${frameID}`
    }
  };
  console.log('postData', postData);

  d3.request(postURL)
    .header("Accept-Language", "en-US")
    .header("X-Requested-With", "XMLHttpRequest")
    .header("Content-Type","application/json")
    .mimeType("application/json")
    .response(function(xhr) { return JSON.parse(xhr.responseText); })
    .send("POST", JSON.stringify(postData), handleResponse);
}