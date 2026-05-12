#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 </dev/null >> /home/z/my-project/dev.log 2>&1
  echo "Server died, restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
