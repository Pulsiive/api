#!/bin/bash
set -e
cd /home/ubuntu/api
pm2 start dist/src/index.js
