#!/bin/bash

CONTAINER_ALREADY_STARTED="container_already_started"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    npm install -g ts-node
    npx prisma migrate dev
    npx prisma generate 
    npx prisma db seed
fi
npm run dev
