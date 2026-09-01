// server.ts
import { createServer } from "http";
import next from "next";
import { initSocket } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Initialize Socket.IO here
  initSocket(server);

  server.listen(3000, () => {
    console.log("✅ Server ready on http://localhost:3000");
  });
});
