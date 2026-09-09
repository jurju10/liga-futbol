import { getStore } from "@netlify/blobs";

const CLAVE = "liga-datos";
// Debe coincidir con CODIGO_EDICION en src/App.jsx
const CLAVE_ORGANIZADOR = "CAMPO10";

function redactarSolicitudes(datos) {
  if (!datos || !Array.isArray(datos.solicitudes)) return datos;
  return {
    ...datos,
    solicitudes: datos.solicitudes.map((s) => ({ id: s.id, partidoId: s.partidoId })),
  };
}

export default async (req) => {
  const store = getStore("liga-futbol");

  if (req.method === "GET") {
    const valor = await store.get(CLAVE);
    if (!valor) {
      return new Response("", { headers: { "content-type": "application/json" } });
    }
    const esOrganizador = req.headers.get("x-clave-organizador") === CLAVE_ORGANIZADOR;
    const datos = JSON.parse(valor);
    const salida = esOrganizador ? datos : redactarSolicitudes(datos);
    return new Response(JSON.stringify(salida), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const cuerpoTexto = await req.text();
    let nuevo;
    try {
      nuevo = JSON.parse(cuerpoTexto);
    } catch {
      nuevo = null;
    }

    // Si quien guarda no veía los emails/claves (porque no es el organizador),
    // los recuperamos del valor ya guardado en vez de sobrescribirlos en blanco.
    if (nuevo && Array.isArray(nuevo.solicitudes)) {
      const anteriorTexto = await store.get(CLAVE);
      const anterior = anteriorTexto ? JSON.parse(anteriorTexto) : null;
      if (anterior && Array.isArray(anterior.solicitudes)) {
        const anteriorPorId = Object.fromEntries(anterior.solicitudes.map((s) => [s.id, s]));
        nuevo.solicitudes = nuevo.solicitudes.map((s) => {
          if (s.email && s.clave) return s;
          const previa = anteriorPorId[s.id];
          return previa ? { ...s, email: previa.email, clave: previa.clave } : s;
        });
      }
    }

    await store.set(CLAVE, JSON.stringify(nuevo));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/api/liga-data" };
