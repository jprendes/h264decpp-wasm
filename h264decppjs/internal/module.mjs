import Module from "../../build/h264decpp-wasm.mjs";

export default new Promise((resolve) => {
    const module = new Module({
        onRuntimeInitialized: () => resolve(module)
    });
});