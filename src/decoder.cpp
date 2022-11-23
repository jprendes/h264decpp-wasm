#include <emscripten.h>

#include <optional>

#include "h264decpp/decoder.hpp"

namespace {

struct h264decpp_decoder {
    h264decpp::decoder decoder;
    std::optional<h264decpp::decoder::frame> output;
};

}

extern "C" {

h264decpp_decoder * EMSCRIPTEN_KEEPALIVE make_h264decpp_decoder() {
    return new h264decpp_decoder{h264decpp::decoder(), std::nullopt};
}

void EMSCRIPTEN_KEEPALIVE destroy_h264decpp_decoder(h264decpp_decoder * decoder) {
    delete decoder;
}

uint8_t const * EMSCRIPTEN_KEEPALIVE h264decpp_decoder_decode(h264decpp_decoder * decoder, uint8_t * input_data, size_t input_size) {
    decoder->output = decoder->decoder.decode({input_data, input_size});
    if (!decoder->output) return nullptr;
    return decoder->output->buffer.data();
}

uint8_t const * EMSCRIPTEN_KEEPALIVE h264decpp_decoder_flush(h264decpp_decoder * decoder) {
    decoder->output = decoder->decoder.flush();
    if (!decoder->output) return nullptr;
    return decoder->output->buffer.data();
}

size_t EMSCRIPTEN_KEEPALIVE h264decpp_decoder_frame_size(h264decpp_decoder * decoder) {
    if (!decoder->output) return 0;
    return decoder->output->buffer.size();
}

size_t EMSCRIPTEN_KEEPALIVE h264decpp_decoder_frame_width(h264decpp_decoder * decoder) {
    if (!decoder->output) return 0;
    return decoder->output->width;
}

size_t EMSCRIPTEN_KEEPALIVE h264decpp_decoder_frame_height(h264decpp_decoder * decoder) {
    if (!decoder->output) return 0;
    return decoder->output->height;
}

}