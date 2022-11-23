import h264decppjs from "../h264decppjs/index.mjs";
import YUVCanvas from 'https://cdn.skypack.dev/yuv-canvas';

window.YUVCanvas = YUVCanvas;

function find_nal(data, offset) {
    let state  = 0;
    for (let i = offset + 4; i < data.byteLength; i++) {
        if (data[i] === 0) {
            ++state;
        } else if (data[i] === 1 && (state === 2 || state === 3)) {
            return i - state;
        } else {
            state = 0;
        }
    }
    return data.byteLength + 1;
}

function split_nals(data) {
    const nals = [];
    let start = 0;
    do {
        const end = find_nal(data, start);
        nals.push(data.slice(start, end));
        start = end;
    } while (start < data.byteLength);
    return nals;
}

function draw_frame(yuv_canvas, frame) {
    const w = frame.width;
    const h = frame.height;
    const w_2 = Math.floor(w / 2);
    const h_2 = Math.floor(h / 2);
    yuv_canvas.drawFrame({
        format: {
            width: w,
            height: h,
            chromaWidth: w_2,
            chromaHeight: h_2,
            cropLeft: 0,
            cropTop: 0,
            cropWidth: w,
            cropHeight: h,
            displayWidth: w,
            displayHeight: h,
        },
        y: {
            bytes: frame.data.slice(0, w*h),
            stride: w,
        },
        u: {
            bytes: frame.data.slice(w*h, w*h + w_2*h_2),
            stride: w_2,
        },
        v: {
            bytes: frame.data.slice(w*h + w_2*h_2, w*h + 2*w_2*h_2),
            stride: w_2
        }
    });
}

async function demo(yuv_canvas) {
    const dec = new h264decppjs.decoder();
    await dec.ready;

    const res = await fetch("../upstream/h264decpp/upstream/ffmpeg-h264-dec/test/352x288Foreman.264");
    const data = new Int8Array(await res.arrayBuffer());

    const nals = split_nals(data);

    console.log(nals);

    console.log("start");
    console.log(`will decode ${nals.length} nals`);
    const start = performance.now();

    let total_samples = 0;
    for (let i = 0; i < nals.length; i++) {
        const next = new Promise(resolve => setTimeout(resolve, 1000/30));
        const decoded = dec.decode(nals[i]);
        if (decoded.data.length) {
            total_samples++;
            draw_frame(yuv_canvas, decoded);
            await next;
        }
    }
    while (true) {
        const next = new Promise(resolve => setTimeout(resolve, 1000/30));
        const decoded = dec.flush();
        if (decoded.data.length) {
            total_samples++;
            draw_frame(yuv_canvas, decoded);
            await next;
        } else {
            break;
        }
    }

    const end = performance.now();
    console.log("done");
    console.log(`decoded ${total_samples} frames`);
    console.log(`decoding took ${end-start} ms`);

    dec.destroy();

    return {
        elapsed: end - start,
    };
}

const container = document.createElement("div");

const start_btn = document.createElement("button");
start_btn.textContent = "start";

start_btn.addEventListener("click", async () => {
    container.innerText = "processing";

    container.appendChild(document.createElement("br"));

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const yuv_canvas = YUVCanvas.attach(canvas);

    const { elapsed } = await demo(yuv_canvas);

    container.innerText = `encoding and decoding took ${Math.round(elapsed)} ms`;
});

document.body.appendChild(start_btn);
document.body.appendChild(container);