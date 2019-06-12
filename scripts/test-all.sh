#!/bin/sh

p_skip=${1}

if [ "$p_skip" = '--skip' ]; then
  npm run dist && \
  node ./tests/dekko/dist.test.js && \
  npm run compile && \
  node ./tests/dekko/lib.test.js
else
  npm run lint && \
  npm run dist && \
  node ./tests/dekko/dist.test.js && \
  LIB_DIR=dist npm test && \
  npm run compile && \
  node ./tests/dekko/lib.test.js && \
  LIB_DIR=es npm test && \
  LIB_DIR=lib npm test && \
  npm test && \
  npm run test-node
fi

