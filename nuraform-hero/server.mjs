import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PORT = 4321;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(normalize(ROOT))) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    const info = await stat(filePath);

    // Range requests (needed for reliable <video> playback/seeking)
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : info.size - 1;
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= info.size) end = info.size - 1;
      if (start > end) { res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end(); return; }
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Range": `bytes ${start}-${end}/${info.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Cache-Control": "no-cache",
      });
      createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": info.size,
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(PORT, () => console.log(`Nuraform hero clone running at http://localhost:${PORT}`));
