#!/bin/bash
cd /home/z/my-project
while true; do
  if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "$(date): Server not running, starting..." >> /home/z/my-project/keepalive.log
    rm -rf /home/z/my-project/.next
    node /home/z/my-project/node_modules/.bin/next dev -p 3000 -H 0.0.0.0 </dev/null >> /home/z/my-project/dev.log 2>&1 &
    echo "$(date): Started PID $!" >> /home/z/my-project/keepalive.log
  fi
  sleep 3
done
