#!/bin/bash

CONTAINER_ALREADY_STARTED="container_already_started"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    npm install -g ts-node
    npm run docker-generate-db-models
    npm run docker-generate-db-test-models
    npx prisma generate
    npm run seed
fi
npm run dev
