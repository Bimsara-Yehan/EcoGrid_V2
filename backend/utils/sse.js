// backend/utils/sse.js
// Simple in-memory SSE bus for broadcasting events to connected clients

const clients = new Set(); // Set< { res, heartbeatId } >

export function addSseClient(res) {
  const client = { res, heartbeatId: null };
  clients.add(client);
  // send a comment to establish the stream
  try { res.write(": connected\n\n"); } catch {}
  // heartbeat every 25s so proxies keep connection open
  client.heartbeatId = setInterval(() => {
    try { res.write(": ping\n\n"); } catch {}
  }, 25000);
  return client;
}

export function removeSseClient(client) {
  try { if (client?.heartbeatId) clearInterval(client.heartbeatId); } catch {}
  if (client && clients.has(client)) clients.delete(client);
}

export function broadcast(event, data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    try {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      // drop broken client
      removeSseClient(client);
    }
  }
}



