function getFrameDataFromVisDataServer(selector, options) {
  console.log('arguments from getFrameDataFromVisDataServer', arguments);
  const server = options.server;
  const port = options.port;
  const endPoint = options.endPoint;
  const frameID = options.frameID;
  const tunnel = options.tunnel;
  let h2oIP = options.h2oIP;
  const h2oPort = options.h2oPort;

  if (h2oIP === 'localhost') {
    h2oIP = `localhost:${h2oPort}`;
  }

  postURL = `http://${h2oIP}/3/Vis/Network`;

  console.log('postURL', postURL);

  const postData = {
    "graphic": {
        "type": "network",
        "parameters": {
            "matrix_type": "data",
            "normalize": true
        }
    },
    "data": {
        "uri": `${frameID}`
    }
  };
  console.log('postData', postData);

  d3.request(postURL)
    .header("Accept-Language", "en-US")
    // .header("X-Requested-With", "XMLHttpRequest")
    .header("Content-Type","application/json")
    .mimeType("application/json")
    .response(function(xhr) { return JSON.parse(xhr.responseText); })
    .send("POST", JSON.stringify(postData), handleResponse);
}