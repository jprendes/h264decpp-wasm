export default class buffer {
    #module = null;
    #pointer = 0;
    #size = 0;
    #capacity = 0;

    constructor(module) {
        this.#module = module;
    }

    destroy() {
        this.resize(0, true);
    }

    get size() {
        return this.pointer ? this.#size : 0;
    }

    get capacity() {
        return this.pointer ? this.#capacity : 0;
    }

    get pointer() {
        return this.#pointer;
    }

    resize(new_size, shrink = false) {
        if (new_size == this.capacity) {
            this.#size = new_size;
            return;
        }
        if (new_size < this.capacity && !shrink) {
            this.#size = new_size;
            return;
        }
        // reallocation required
        if (this.pointer) {
            this.#module._free(this.pointer);
            this.#pointer = 0;
            this.#capacity = 0;
            this.#size = 0;
        }
        if (new_size) {
            this.#pointer = this.#module._malloc(new_size);
            this.#capacity = new_size;
            this.#size = new_size;
        }
    }

    store(data) {
        if (this.size < data.byteLength) {
            this.resize(data.byteLength);
        }
        if (data instanceof Uint8Array) {
            this.#module.HEAPU8.set(data, this.pointer);
        } else if (data instanceof Int8Array) {
            this.#module.HEAP8.set(data, this.pointer);
        } else if (data instanceof Uint16Array) {
            this.#module.HEAPU16.set(data, this.pointer >> 1);
        } else if (data instanceof Int16Array) {
            this.#module.HEAP16.set(data, this.pointer >> 1);
        } else if (data instanceof Uint32Array) {
            this.#module.HEAPU32.set(data, this.pointer >> 2);
        } else if (data instanceof Int32Array) {
            this.#module.HEAP32.set(data, this.pointer >> 2);
        } else if (data instanceof Float32Array) {
            this.#module.HEAPF32.set(data, this.pointer >> 2);
        } else if (data instanceof Float64Array) {
            this.#module.HEAPF64.set(data, this.pointer >> 3);
        } else if (data instanceof ArrayBuffer) {
            this.#module.HEAPU8.set(new Uint8Array(data), this.pointer);
        } else {
            throw new Error("Unknown data type");
        }
    }
};
