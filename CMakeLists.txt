cmake_minimum_required(VERSION 3.10)

project(h264decpp VERSION 0.1)

include(cmake/build_type.cmake)
include(cmake/emscripten_flags.cmake)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_EXPORT_COMPILE_COMMANDS True)

set(CMAKE_EXECUTABLE_SUFFIX ".mjs")

option(H264DECPP_BUILD_DEMO "" OFF)

add_subdirectory(upstream/h264decpp h264decpp)

add_executable(h264decpp-wasm
    src/decoder.cpp
)

target_link_libraries(h264decpp-wasm PUBLIC
    h264decpp
)