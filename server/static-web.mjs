import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 8080);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist-web");
const basePath = "/got2get2work";
const headers = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.run.app https://*.googleapis.com https://*.firebaseapp.com; font-src 'self' data:; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"], [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".png", "image/png"],
]);

function candidate(urlPath) {
  const relative = urlPath.startsWith(`${basePath}/`) ? urlPath.slice(basePath.length + 1) : urlPath.replace(/^\//, "");
  const normalized = path.normalize(relative || "index.html");
  const resolved = path.resolve(root, normalized);
  return resolved.startsWith(`${root}${path.sep}`) || resolved === path.join(root, "index.html") ? resolved : null;
}

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname === "/") {
    response.writeHead(308, { ...headers, Location: `${basePath}/` });
    return response.end();
  }
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404, { ...headers, "Content-Type": "text/plain; charset=utf-8" });
    return response.end("Not found");
  }
  let file = candidate(pathname);
  try {
    if (!file || !(await stat(file)).isFile()) file = path.join(root, "index.html");
    const details = await stat(file);
    response.writeHead(200, {
      ...headers,
      "Cache-Control": file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
      "Content-Length": details.size,
      "Content-Type": contentTypes.get(path.extname(file)) ?? "application/octet-stream",
    });
    if (request.method === "HEAD") return response.end();
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(500, { ...headers, "Content-Type": "text/plain; charset=utf-8" });
    response.end("Service unavailable");
  }
});

server.listen(port, "0.0.0.0");
