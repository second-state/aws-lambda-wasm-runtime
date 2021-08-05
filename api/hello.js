const { spawn } = require('child_process');
const path = require('path');

function _runWasm(reqBody) {
  return new Promise(resolve => {
    const wasmedge = spawn(
      path.join(__dirname, 'wasmedge-tensorflow-lite'),
      [path.join(__dirname, 'classify.so')],
      {env: {'LD_LIBRARY_PATH': __dirname}}
    );

    let d = [];
    wasmedge.stdout.on('data', (data) => {
      d.push(data);
    });

    wasmedge.on('close', (code) => {
      resolve(d.join(''));
    });

    wasmedge.stdin.write(reqBody);
    wasmedge.stdin.end('');
  });
}

exports.handler = async function(event, context) {
  var typedArray = new Uint8Array(event.body.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  let result = await _runWasm(typedArray);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
    },
    body: result
  };
}
