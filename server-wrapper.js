const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const INTERNAL_PORT = 3001;
let childProc = null;
let restarting = false;
const LOG = path.join(__dirname, 'dev.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
}

function startInternal() {
  if (childProc) {
    try { childProc.kill('SIGKILL'); } catch(e) {}
  }
  
  childProc = spawn('node', [
    path.join(__dirname, '.next/standalone/server.js'),
    '-p', String(INTERNAL_PORT),
    '-H', '0.0.0.0'
  ], {
    cwd: __dirname,
    stdio: ['ignore', fs.openSync(LOG, 'a'), fs.openSync(LOG, 'a')],
    env: { ...process.env, PORT: String(INTERNAL_PORT) }
  });
  
  childProc.on('exit', () => {
    log('Internal server died, restarting...');
    if (!restarting) {
      restarting = true;
      setTimeout(() => { startInternal(); restarting = false; }, 500);
    }
  });
  
  childProc.on('error', (err) => {
    log('Internal server error: ' + err.message);
  });
}

// Main proxy server
const server = http.createServer((req, res) => {
  const proxy = http.request({
    hostname: '127.0.0.1',
    port: INTERNAL_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
    timeout: 8000
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxy.on('error', () => {
    // Internal server not ready yet, restart and retry
    log('Proxy error, restarting internal server...');
    startInternal();
    setTimeout(() => {
      const retry = http.request({
        hostname: '127.0.0.1',
        port: INTERNAL_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers,
        timeout: 10000
      }, (retryRes) => {
        res.writeHead(retryRes.statusCode, retryRes.headers);
        retryRes.pipe(res);
      });
      retry.on('error', () => {
        res.writeHead(502);
        res.end('Service starting...');
      });
      retry.pipe(req);
    }, 1000);
  });
  
  req.pipe(proxy);
});

server.listen(PORT, '0.0.0.0', () => {
  log(`Wrapper listening on ${PORT}`);
  startInternal();
});

// Keep internal server alive
setInterval(() => {
  const sock = net.createConnection(INTERNAL_PORT, '127.0.0.1', () => {
    sock.destroy();
  });
  sock.on('error', () => {
    if (!restarting) {
      restarting = true;
      log('Health check failed, restarting...');
      startInternal();
      setTimeout(() => { restarting = false; }, 500);
    }
  });
}, 5000);
