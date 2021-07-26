const { spawn } = require('child_process');
const path = require('path');

function _runWasm(reqBody) {
  return new Promise(resolve => {
    const wasmedge = spawn(path.join(__dirname, 'wasmedge'), [path.join(__dirname, 'grayscale.so')]);

    let d = [];
    wasmedge.stdout.on('data', (data) => {
      d.push(data);
    });

    wasmedge.on('close', (code) => {
      let buf = Buffer.concat(d);
      resolve(buf);
    });

    wasmedge.stdin.write(reqBody);
    wasmedge.stdin.end('');
  });
}

exports.handler = async function(event, context) {
  var typedArray = new Uint8Array(event.body.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  let buf = await _runWasm(typedArray);
  return {
    statusCode: 200,
    body: buf.toString('hex')
  };
}
