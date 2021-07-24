const { spawn } = require('child_process');
const path = require('path');

function _runWasm(reqBody) {
  return new Promise(resolve => {
    setTimeout(() => {
      
    }, 2000);
    const wasmedge = spawn(path.join(__dirname, 'wasmedge'), [path.join(__dirname, 'grayscale.so')]);

    let d = [];
    wasmedge.stdout.on('data', (data) => {
      d.push(data);
    });

    wasmedge.on('close', (code) => {
      let r = d.join('');
      resolve({
        format: r.substring(0, 3),
        body: r.substring(3)
      });
    });

    wasmedge.stdin.write(reqBody);
    wasmedge.stdin.end('');
  });
}

exports.handler = async function(event, context) {
  var typedArray = new Uint8Array(event.body.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  let {format, body} = await _runWasm(typedArray);
  return {
    statusCode: 200,
    headers: {'Content-Type': `image/${format}`},
    body
  };
}
