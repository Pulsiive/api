#!/bin/bash
set -e
pm2 stop all || true
cd /home/ubuntu/api
sudo npm install
sudo npm run build
