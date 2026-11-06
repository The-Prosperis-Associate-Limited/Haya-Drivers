import { copyFileSync, mkdirSync } from "node:fs";

const FILES = ["vision_wasm_internal.js", "vision_wasm_internal.wasm", "vision_wasm_nosimd_internal.js", "vision_wasm_nosimd_internal.wasm"];
const from = "node_modules/@mediapipe/tasks-vision/wasm";
const to = "public/mediapipe/wasm";

mkdirSync(to, { recursive: true });
for (const file of FILES) copyFileSync(`${from}/${file}`, `${to}/${file}`);
