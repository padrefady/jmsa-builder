// Lightweight keepalive for Next.js dev server
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG = path.join(__dirname, 'dev.log');
const MAX_RESTARTS = 100;
let restarts = 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3000/', (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}

function startServer() {
  if (restarts >= MAX_RESTARTS) {
    log('Max restarts reached');
    process.exit(1);
  }

  restarts++;
  log(`Starting server (attempt ${restarts})...`);

  // Clean build cache
  try {
    const cacheDir = path.join(__dirname, '.next');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (e) { /* ignore */ }

  const child = spawn(
    'node',
    ['node_modules/.bin/next', 'dev', '-p', '3000', '-H', '0.0.0.0'],
    {
      cwd: __dirname,
      stdio: ['ignore', fs.openSync(LOG, 'a'), fs.openSync(LOG, 'a')],
      detached: false,
    }
  );

  child.on('exit', (code) => {
    log(`Server exited with code ${code}`);
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    log(`Server error: ${err.message}`);
    setTimeout(startServer, 3000);
  });

  // Monitor health
  const monitor = setInterval(async () => {
    if (child.killed) {
      clearInterval(monitor);
      return;
    }
    const alive = await checkServer();
    if (!alive) {
      log('Server not responding, killing and restarting...');
      clearInterval(monitor);
      try { child.kill('SIGKILL'); } catch (e) {}
      setTimeout(startServer, 3000);
    }
  }, 15000);
}

log('Keepalive started');
startServer();
