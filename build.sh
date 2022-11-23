#!/bin/bash

emsdk() {
    docker run \
        --rm \
        -v $(pwd):/src \
        -u $(id -u):$(id -g) \
        emscripten/emsdk \
        "$@"
}

emsdk emcmake cmake -B build/
emsdk emmake make -C build/