import React, { useState } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [enableWasm, setEnableWasm] = useState(false);
  const [origImg, setOrigImg] = useState(null);
  const [resImg, setResImg] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.container}>
      <Head>
        <title>Netlify Wasm Runtime</title>
        <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://github.com/WasmEdge/WasmEdge">WasmEdge!</a>
        </h1>

        <div className={styles.operating}>
          <div>
            <input type="file" id="fileElem" accept="image/png" className={styles['visually-hidden']} onChange={fileSelected} />
            <label htmlFor="fileElem" className={styles.noselect}>Select an image</label>
            <div className={styles.thumb}>
              {origImg && <img src={origImg.src} />}
            </div>
          </div>
          <div>
            <button id="runBtn" onClick={runWasm} disabled={!enableWasm || loading}>{loading ? 'Loading' : 'Run Wasm'}</button>
            <div className={styles.thumb}>
              {resImg && <img src={resImg.src} />}
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://netlify.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Netlify
        </a>
      </footer>
    </div>
  );

  function fileSelected(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/png')) {
      alert('Please select a png image.');
      return;
    }

    const img = document.createElement('img');
    img.file = file

    const reader = new FileReader();
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
        setOrigImg(aImg);
        setEnableWasm(true);
      };
    })(img);
    reader.readAsDataURL(file);
  }

  function runWasm(e) {
    const img = document.createElement('img');

    const reader = new FileReader();
    reader.onload = function(e) {
      setLoading(true);
      var oReq = new XMLHttpRequest();
      oReq.open("POST", '/.netlify/functions/hello', true);
      oReq.onload = (function(bImg) {
        return function (oEvent) {
          setLoading(false);
          const typedArray = new Uint8Array(oReq.response.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
          }));
          const b = new Blob([typedArray.buffer], {type: 'image/png'});
          bImg.src = URL.createObjectURL(b);
          setResImg(bImg);
          URL.revokeObjectURL(b);
        };
      })(img);
      // const blob = new Blob([e.target.result], {type: 'application/octet-stream'});

      oReq.send(buf2hex(e.target.result));
    };
    reader.readAsArrayBuffer(origImg.file);
  }
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
}