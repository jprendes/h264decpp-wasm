import module_promise from "./internal/module.mjs";
import buffer from "./internal/buffer.mjs";

export default class decoder {
    #module = null;
    #handler = null;
    #ready = null;
    #buffer = null;

    constructor() {
        this.#ready = (async () => {
            this.#module = await module_promise;
            this.#buffer = new buffer(this.#module);
            this.#handler = this.#module._make_h264decpp_decoder();
        })();
    }

    get ready() {
        return this.#ready;
    }

    async destroy() {
        await this.ready;
        this.#module._destroy_h264decpp_decoder(this.#handler);
        this.#buffer.destroy();
    }

    #validate = () => {
        if (!this.#handler) throw new Error("Decoder is not ready");
    }

    #make_frame(data_ptr) {
        const data_size = this.#module._h264decpp_decoder_frame_size(this.#handler);
        const width = this.#module._h264decpp_decoder_frame_width(this.#handler);
        const height = this.#module._h264decpp_decoder_frame_height(this.#handler);
        return {
            data: this.#module.HEAPU8.slice(data_ptr, data_ptr + data_size),
            width,
            height,
        };        
    }

    decode(input) {
        this.#validate();
        this.#buffer.store(input);
        const data_ptr = this.#module._h264decpp_decoder_decode(this.#handler, this.#buffer.pointer, this.#buffer.size);
        return this.#make_frame(data_ptr);
    }

    flush() {
        this.#validate();
        const data_ptr = this.#module._h264decpp_decoder_flush(this.#handler);
        return this.#make_frame(data_ptr);
    }
};
