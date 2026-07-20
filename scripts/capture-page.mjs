import { writeFile } from "node:fs/promises";

const [port = "9223", pageUrl, outputPath, widthValue = "390", heightValue = "844"] = process.argv.slice(2);
if (!pageUrl || !outputPath) throw new Error("Usage: node scripts/capture-page.mjs <port> <url> <output> [width] [height]");
const width = Number(widthValue);
const height = Number(heightValue);
const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
});
function call(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
await call("Page.enable");
await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600, screenWidth: width, screenHeight: height });
await call("Page.navigate", { url: pageUrl });
await new Promise((resolve) => setTimeout(resolve, 2500));
const dimensions = await call("Runtime.evaluate", { expression: "(() => { const brand = document.querySelector('header a'); const menu = document.querySelector('header button'); const rect = (node) => node ? ({ x: node.getBoundingClientRect().x, width: node.getBoundingClientRect().width, display: getComputedStyle(node).display }) : null; return { innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, innerHeight: window.innerHeight, scrollX: window.scrollX, brand: rect(brand), menu: rect(menu) }; })()", returnByValue: true });
const screenshot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, fromSurface: true });
await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
process.stdout.write(JSON.stringify(dimensions.result.value));
socket.close();
await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
