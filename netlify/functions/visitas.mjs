import { getStore } from "@netlify/blobs";

const CLAVE = "visitas-contador";

export default async (req) => {
  const store = getStore("liga-futbol");

  if (req.method === "GET") {
    const valor = await store.get(CLAVE);
    return new Response(valor || "0", { headers: { "content-type": "text/plain" } });
  }

  if (req.method === "POST") {
    const valor = await store.get(CLAVE);
    const actual = valor ? parseInt(valor, 10) || 0 : 0;
    const nuevo = actual + 1;
    await store.set(CLAVE, String(nuevo));
    return new Response(String(nuevo), { headers: { "content-type": "text/plain" } });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/api/visitas" };
