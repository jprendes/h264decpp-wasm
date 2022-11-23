export default class player {
    #ctx = new (window.AudioContext || window.webkitAudioContext)();
    #sample_rate = 44100;
    #num_channels = 1;
    #last_time = 0;

    constructor(sample_rate, stereo) {
        this.pause();
        this.#sample_rate = sample_rate;
        this.#num_channels = stereo ? 2 : 1;
    }

    get playing() {
        return this.#ctx.state === "running";
    }

    get buffered() {
        return Math.max(0, this.#last_time - this.#ctx.currentTime);
    }

    append(data) {
        const num_samples = Math.floor(data.length / this.#num_channels);

        if (num_samples === 0) return;

        const buffer = this.#ctx.createBuffer(this.#num_channels, num_samples, this.#sample_rate);

        if (this.#num_channels == 2) {
            const left = buffer.getChannelData(0);
            const right = buffer.getChannelData(1);
            for (let k = 0, i = 0; k < num_samples; ++k) {
                left[k] = data[i++] / 32768;
                right[k] = data[i++] / 32768;
            }
        } else {
            const mono = buffer.getChannelData(0);
            for (let k = 0; k < num_samples; ++k) {
                mono[k] = data[k] / 32768;
            }
        }

        const source = this.#ctx.createBufferSource();
        source.buffer = buffer;

        const start_time = Math.max(this.#last_time, this.#ctx.currentTime);
        this.#last_time = start_time + num_samples / this.#sample_rate;

        source.connect(this.#ctx.destination);
        source.start(start_time);
    }

    pause() {
        return this.#ctx.suspend();
    }

    play() {
        return this.#ctx.resume();
    }

    close() {
        return this.#ctx.close();
    }
};