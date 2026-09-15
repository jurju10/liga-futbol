import { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Unlock, Plus, Trash2, Play, CheckCircle2, Undo2, Pause, ChevronDown, ChevronRight, Pencil } from "lucide-react";

const STORAGE_KEY = "liga-datos";
const VISITAS_KEY = "liga-visitas";
const CODIGO_EDICION = "CAMPO10"; // código que deben usar los colaboradores para editar

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Equipos oficiales — División de Honor Juvenil, Grupo 2, temporada 2026-2027 (RFEF)
const EQUIPOS_DHJ = [
  { id: "eq1", nombre: "Deportivo Alavés" },
  { id: "eq2", nombre: "Antiguoko KE" },
  { id: "eq3", nombre: "CD Arratia" },
  { id: "eq4", nombre: "Athletic Club" },
  { id: "eq5", nombre: "Cultural Leonesa" },
  { id: "eq6", nombre: "CD Betoño" },
  { id: "eq7", nombre: "Danok Bat" },
  { id: "eq8", nombre: "EF Mareo" },
  { id: "eq9", nombre: "SD Indautxu" },
  { id: "eq10", nombre: "Real Sociedad" },
  { id: "eq11", nombre: "Real Valladolid" },
  { id: "eq12", nombre: "Santutxu FC" },
  { id: "eq13", nombre: "SD Eibar" },
  { id: "eq14", nombre: "SD Leioa" },
  { id: "eq15", nombre: "UD Logroñés" },
  { id: "eq16", nombre: "Unionistas Salamanca" },
];

// Calendario oficial completo (30 jornadas) publicado por la RFEF para el Grupo 2, temporada 2026-2027.
// Cada pareja [local, visitante] usa el índice del equipo en EQUIPOS_DHJ (1-16).
const CALENDARIO_DHJ_G2 = [
  { jornada: 1, fecha: "2026-09-06", enc: [[1,3],[14,5],[12,7],[10,9],[8,11],[6,13],[4,15],[16,2]] },
  { jornada: 2, fecha: "2026-09-13", enc: [[3,16],[5,1],[7,14],[9,12],[11,10],[13,8],[15,6],[2,4]] },
  { jornada: 3, fecha: "2026-09-20", enc: [[3,5],[1,7],[14,9],[12,11],[10,13],[8,15],[6,2],[16,4]] },
  { jornada: 4, fecha: "2026-10-04", enc: [[5,16],[7,3],[9,1],[11,14],[13,12],[15,10],[2,8],[4,6]] },
  { jornada: 5, fecha: "2026-10-11", enc: [[5,7],[3,9],[1,11],[14,13],[12,15],[10,2],[8,4],[16,6]] },
  { jornada: 6, fecha: "2026-10-18", enc: [[7,16],[9,5],[11,3],[13,1],[15,14],[2,12],[4,10],[6,8]] },
  { jornada: 7, fecha: "2026-10-25", enc: [[7,9],[5,11],[3,13],[1,15],[14,2],[12,4],[10,6],[16,8]] },
  { jornada: 8, fecha: "2026-11-01", enc: [[9,16],[11,7],[13,5],[15,3],[2,1],[4,14],[6,12],[8,10]] },
  { jornada: 9, fecha: "2026-11-08", enc: [[9,11],[7,13],[5,15],[3,2],[1,4],[14,6],[12,8],[16,10]] },
  { jornada: 10, fecha: "2026-11-22", enc: [[11,16],[13,9],[15,7],[2,5],[4,3],[6,1],[8,14],[10,12]] },
  { jornada: 11, fecha: "2026-11-29", enc: [[11,13],[9,15],[7,2],[5,4],[3,6],[1,8],[14,10],[16,12]] },
  { jornada: 12, fecha: "2026-12-06", enc: [[13,16],[15,11],[2,9],[4,7],[6,5],[8,3],[10,1],[12,14]] },
  { jornada: 13, fecha: "2026-12-13", enc: [[13,15],[11,2],[9,4],[7,6],[5,8],[3,10],[1,12],[16,14]] },
  { jornada: 14, fecha: "2026-12-16", enc: [[16,15],[2,13],[4,11],[6,9],[8,7],[10,5],[12,3],[14,1]] },
  { jornada: 15, fecha: "2026-12-20", enc: [[15,2],[13,4],[11,6],[9,8],[7,10],[5,12],[3,14],[1,16]] },
  { jornada: 16, fecha: "2027-01-10", enc: [[3,1],[5,14],[7,12],[9,10],[11,8],[13,6],[15,4],[2,16]] },
  { jornada: 17, fecha: "2027-01-24", enc: [[16,3],[1,5],[14,7],[12,9],[10,11],[8,13],[6,15],[4,2]] },
  { jornada: 18, fecha: "2027-01-31", enc: [[5,3],[7,1],[9,14],[11,12],[13,10],[15,8],[2,6],[4,16]] },
  { jornada: 19, fecha: "2027-02-07", enc: [[16,5],[3,7],[1,9],[14,11],[12,13],[10,15],[8,2],[6,4]] },
  { jornada: 20, fecha: "2027-02-14", enc: [[7,5],[9,3],[11,1],[13,14],[15,12],[2,10],[4,8],[6,16]] },
  { jornada: 21, fecha: "2027-02-21", enc: [[16,7],[5,9],[3,11],[1,13],[14,15],[12,2],[10,4],[8,6]] },
  { jornada: 22, fecha: "2027-02-28", enc: [[9,7],[11,5],[13,3],[15,1],[2,14],[4,12],[6,10],[8,16]] },
  { jornada: 23, fecha: "2027-03-07", enc: [[16,9],[7,11],[5,13],[3,15],[1,2],[14,4],[12,6],[10,8]] },
  { jornada: 24, fecha: "2027-03-14", enc: [[11,9],[13,7],[15,5],[2,3],[4,1],[6,14],[8,12],[10,16]] },
  { jornada: 25, fecha: "2027-03-21", enc: [[16,11],[9,13],[7,15],[5,2],[3,4],[1,6],[14,8],[12,10]] },
  { jornada: 26, fecha: "2027-04-04", enc: [[13,11],[15,9],[2,7],[4,5],[6,3],[8,1],[10,14],[12,16]] },
  { jornada: 27, fecha: "2027-04-11", enc: [[16,13],[11,15],[9,2],[7,4],[5,6],[3,8],[1,10],[14,12]] },
  { jornada: 28, fecha: "2027-04-18", enc: [[15,13],[2,11],[4,9],[6,7],[8,5],[10,3],[12,1],[14,16]] },
  { jornada: 29, fecha: "2027-04-25", enc: [[15,16],[13,2],[11,4],[9,6],[7,8],[5,10],[3,12],[1,14]] },
  { jornada: 30, fecha: "2027-05-02", enc: [[2,15],[4,13],[6,11],[8,9],[10,7],[12,5],[14,3],[16,1]] },
];

// Resultados reales de la Jornada 1 (05-06/09/2026), confirmados por el usuario vía Sofascore.
// Clave "local-visitante" con los índices de EQUIPOS_DHJ.
const RESULTADOS_J1 = {
  "1-3": [5, 0],   // Deportivo Alavés 5-0 CD Arratia
  "14-5": [4, 2],  // SD Leioa 4-2 Cultural Leonesa
  "12-7": [1, 1],  // Santutxu FC 1-1 Danok Bat
  "10-9": [5, 1],  // Real Sociedad 5-1 SD Indautxu
  "8-11": [2, 11], // EF Mareo 2-11 Real Valladolid
  "6-13": [1, 2],  // CD Betoño 1-2 SD Eibar
  "4-15": [6, 0],  // Athletic Club 6-0 UD Logroñés
  "16-2": [2, 2],  // Unionistas Salamanca 2-2 Antiguoko KE
};

// Goleadores (y una tarjeta roja) reales de la Jornada 1, confirmados por el usuario vía Sofascore.
// "equipo" es relativo al partido: 'local' o 'visitante'.
const EVENTOS_J1 = {
  "1-3": [
    { minuto: 22, tipo: "gol", equipo: "local", jugador: "Jorge Esteban Hernandez" },
    { minuto: 44, tipo: "gol", equipo: "local", jugador: "Zinedine Hassani Sohaib" },
    { minuto: 59, tipo: "gol", equipo: "local", jugador: "I. Z. Saez" },
    { minuto: 74, tipo: "gol", equipo: "local", jugador: "Ivan Okorie Igidi" },
    { minuto: 83, tipo: "gol", equipo: "local", jugador: "Javier Garcia Ramirez" },
  ],
  "14-5": [
    { minuto: 19, tipo: "gol", equipo: "visitante", jugador: "Gaizka Larrauri" },
    { minuto: 32, tipo: "gol", equipo: "local", jugador: "Kerman Santamaria" },
    { minuto: 58, tipo: "gol", equipo: "local", jugador: "Daniel Vivanco" },
    { minuto: 63, tipo: "gol", equipo: "visitante", jugador: "Manuel Ibanez" },
    { minuto: 90, tipo: "gol", equipo: "local", jugador: "A. B. Morgado" },
    { minuto: 90, tipo: "gol", equipo: "local", jugador: "Ekain Del Rio Esparza" },
  ],
  "12-7": [
    { minuto: 13, tipo: "gol", equipo: "local", jugador: "Iker Vega" },
    { minuto: 76, tipo: "gol", equipo: "visitante", jugador: "Unai Ayala" },
  ],
  "10-9": [
    { minuto: 33, tipo: "gol", equipo: "local", jugador: "X. Echarri" },
    { minuto: 38, tipo: "gol", equipo: "local", jugador: "Manex Artola" },
    { minuto: 50, tipo: "gol", equipo: "local", jugador: "I. L. Ulecia" },
    { minuto: 53, tipo: "gol", equipo: "visitante", jugador: "Aratz Dionisio" },
    { minuto: 85, tipo: "gol", equipo: "local", jugador: "Telmo Gorostizaga" },
    { minuto: 90, tipo: "gol", equipo: "local", jugador: "Iker Agudo" },
  ],
  "8-11": [
    { minuto: 2, tipo: "gol", equipo: "visitante", jugador: "Sergio Merino Caparros" },
    { minuto: 10, tipo: "gol", equipo: "visitante", jugador: "A. Iguaz" },
    { minuto: 17, tipo: "gol", equipo: "visitante", jugador: "Mario Martin Serna" },
    { minuto: 27, tipo: "gol", equipo: "local", jugador: "Daniel Garcia Castillo" },
    { minuto: 42, tipo: "gol", equipo: "visitante", jugador: "A. Iguaz" },
    { minuto: 45, tipo: "gol", equipo: "visitante", jugador: "Sergio Merino Caparros" },
    { minuto: 47, tipo: "gol", equipo: "visitante", jugador: "Sergio Merino Caparros" },
    { minuto: 50, tipo: "gol", equipo: "visitante", jugador: "Marcos Fernandez Cruz" },
    { minuto: 54, tipo: "gol", equipo: "visitante", jugador: "A. Iguaz" },
    { minuto: 64, tipo: "gol", equipo: "visitante", jugador: "Izan Pinilla Ciaurri" },
    { minuto: 68, tipo: "gol", equipo: "visitante", jugador: "Mario Martin Serna" },
    { minuto: 77, tipo: "gol", equipo: "visitante", jugador: "Mohamed Kanta" },
    { minuto: 83, tipo: "gol", equipo: "local", jugador: "Mikel Arriaga Ruiz" },
  ],
  "6-13": [
    { minuto: 17, tipo: "gol", equipo: "visitante", jugador: "Oroitz Villena" },
    { minuto: 20, tipo: "gol", equipo: "local", jugador: "Asier Barrena" },
    { minuto: 43, tipo: "gol", equipo: "visitante", jugador: "Etxahun Sukia" },
  ],
  "4-15": [
    { minuto: 23, tipo: "gol", equipo: "local", jugador: "O. Aguirre" },
    { minuto: 24, tipo: "roja", equipo: "visitante", jugador: "J. Perez" },
    { minuto: 37, tipo: "gol", equipo: "local", jugador: "J. Zabala" },
    { minuto: 40, tipo: "gol", equipo: "local", jugador: "Y. Cisse" },
    { minuto: 75, tipo: "gol", equipo: "local", jugador: "J. Regulez" },
    { minuto: 80, tipo: "gol", equipo: "local", jugador: "B. A. Loyarte" },
    { minuto: 83, tipo: "gol", equipo: "local", jugador: "C. Sarr" },
  ],
  "16-2": [
    { minuto: 15, tipo: "gol", equipo: "local", jugador: "P. L. D. L. Iglesia" },
    { minuto: 62, tipo: "gol", equipo: "local", jugador: "Mario Gomez" },
    { minuto: 64, tipo: "gol", equipo: "visitante", jugador: "Enaut Garmendia" },
    { minuto: 79, tipo: "gol", equipo: "visitante", jugador: "Anass El Fakhkhar Fernandez" },
  ],
};

// Fechas y horas reales de la Jornada 2, confirmadas por el usuario vía Sofascore
// (sustituyen a la fecha genérica de jornada del calendario oficial en PDF).
const HORARIOS_J2 = {
  "3-16": { fecha: "2026-09-12", hora: "17:45" },  // CD Arratia - Unionistas Salamanca
  "5-1": { fecha: "2026-09-12", hora: "17:00" },   // Cultural Leonesa - Deportivo Alavés
  "7-14": { fecha: "2026-09-12", hora: "12:30" },  // Danok Bat - SD Leioa
  "9-12": { fecha: "2026-09-12", hora: "18:00" },  // SD Indautxu - Santutxu FC
  "11-10": { fecha: "2026-09-13", hora: "12:00" }, // Real Valladolid - Real Sociedad
  "13-8": { fecha: "2026-09-12", hora: "12:30" },  // SD Eibar - EF Mareo
  "15-6": { fecha: "2026-09-13", hora: "17:00" },  // UD Logroñés - CD Betoño
  "2-4": { fecha: "2026-09-12", hora: "17:30" },   // Antiguoko KE - Athletic Club
};

// Fechas y horas reales de la Jornada 3, confirmadas por el usuario vía Sofascore.
const HORARIOS_J3 = {
  "1-7": { fecha: "2026-09-19", hora: "12:30" },   // Deportivo Alavés - Danok Bat
  "14-9": { fecha: "2026-09-19", hora: "13:15" },  // SD Leioa - SD Indautxu
  "12-11": { fecha: "2026-09-19", hora: "16:00" }, // Santutxu FC - Real Valladolid
  "3-5": { fecha: "2026-09-19", hora: "18:15" },   // CD Arratia - Cultural Leonesa
  "10-13": { fecha: "2026-09-20", hora: "11:30" }, // Real Sociedad - SD Eibar
  "6-2": { fecha: "2026-09-20", hora: "12:00" },   // CD Betoño - Antiguoko KE
  "8-15": { fecha: "2026-09-20", hora: "16:00" },  // EF Mareo - UD Logroñés
  "16-4": { fecha: "2026-09-20", hora: "17:00" },  // Unionistas Salamanca - Athletic Club
};

// Resultados y goleadores reales de la Jornada 2, confirmados por el usuario vía Sofascore.
const RESULTADOS_J2 = {
  "9-12": [1, 2],  // SD Indautxu 1-2 Santutxu FC
  "3-16": [0, 1],  // CD Arratia 0-1 Unionistas Salamanca
  "2-4": [2, 3],   // Antiguoko KE 2-3 Athletic Club
  "11-10": [3, 1], // Real Valladolid 3-1 Real Sociedad
  "5-1": [2, 2],   // Cultural Leonesa 2-2 Deportivo Alavés
  "7-14": [2, 1],  // Danok Bat 2-1 SD Leioa
  "13-8": [3, 0],  // SD Eibar 3-0 EF Mareo
  "15-6": [2, 1],  // UD Logroñés 2-1 CD Betoño
};
const EVENTOS_J2 = {
  "9-12": [
    { minuto: 40, tipo: "gol", equipo: "local", jugador: "Jon Larrondo" },
    { minuto: 47, tipo: "gol", equipo: "visitante", jugador: "Ibai Henales" },
    { minuto: 50, tipo: "gol", equipo: "visitante", jugador: "Sebastian Amaya" },
  ],
  "3-16": [
    { minuto: 45, tipo: "gol", equipo: "visitante", jugador: "Pablo Sanchez Gala" },
  ],
  "2-4": [
    { minuto: 31, tipo: "gol", equipo: "visitante", jugador: "Alex Esnaola" },
    { minuto: 37, tipo: "gol", equipo: "local", jugador: "Mikel Carcedo" },
    { minuto: 42, tipo: "gol", equipo: "local", jugador: "Mikel Carcedo" },
    { minuto: 48, tipo: "gol", equipo: "visitante", jugador: "Unax Lopez" },
    { minuto: 81, tipo: "gol", equipo: "visitante", jugador: "J. Regulez" },
  ],
  "11-10": [
    { minuto: 17, tipo: "gol", equipo: "local", jugador: "Sergio Merino Caparros" },
    { minuto: 19, tipo: "gol", equipo: "local", jugador: "A. Iguaz" },
    { minuto: 26, tipo: "gol", equipo: "local", jugador: "J. Sanchez" },
    { minuto: 64, tipo: "gol", equipo: "visitante", jugador: "Ibai Galparsoro Barandiaran" },
  ],
  "5-1": [
    { minuto: 17, tipo: "gol", equipo: "local", jugador: "Gaizka Larrauri" },
    { minuto: 43, tipo: "gol", equipo: "visitante", jugador: "Jorge Esteban" },
    { minuto: 52, tipo: "gol", equipo: "local", jugador: "Hugo Garcia" },
    { minuto: 59, tipo: "gol", equipo: "visitante", jugador: "Jorge Esteban" },
  ],
  "7-14": [
    { minuto: 8, tipo: "gol", equipo: "visitante", jugador: "A. B. Morgado" },
    { minuto: 89, tipo: "gol", equipo: "local", jugador: "D. M. Ibarloza" },
    { minuto: 92, tipo: "gol", equipo: "local", jugador: "D. M. Ibarloza" },
  ],
  "13-8": [
    { minuto: 31, tipo: "gol", equipo: "local", jugador: "Jon Iturri Bengoechea" },
    { minuto: 64, tipo: "gol", equipo: "local", jugador: "Oroitz Villena Arandia" },
    { minuto: 81, tipo: "gol", equipo: "local", jugador: "Ekhi Iriondo Leturia" },
  ],
  "15-6": [
    { minuto: 4, tipo: "gol", equipo: "visitante", jugador: "Argoitz Vazquez" },
    { minuto: 19, tipo: "gol", equipo: "local", jugador: "I. Gonzalez" },
    { minuto: 48, tipo: "gol", equipo: "local", jugador: "Christian Serrano" },
  ],
};

function datosDemo() {
  const partidos = [];
  CALENDARIO_DHJ_G2.forEach((j) => {
    j.enc.forEach(([localIdx, visIdx]) => {
      const clavePartido = `${localIdx}-${visIdx}`;
      const resultado = j.jornada === 1 ? RESULTADOS_J1[clavePartido] : j.jornada === 2 ? RESULTADOS_J2[clavePartido] : null;
      const horarioReal = j.jornada === 2 ? HORARIOS_J2[clavePartido] : j.jornada === 3 ? HORARIOS_J3[clavePartido] : null;
      const eventosReales = j.jornada === 1 ? EVENTOS_J1[clavePartido] : j.jornada === 2 ? EVENTOS_J2[clavePartido] : null;
      const eventos = eventosReales
        ? eventosReales.map((ev) => ({
            id: uid(),
            minuto: ev.minuto,
            tipo: ev.tipo,
            equipoId: ev.equipo === "local" ? `eq${localIdx}` : `eq${visIdx}`,
            jugador: ev.jugador,
          }))
        : [];
      partidos.push({
        id: uid(),
        jornada: j.jornada,
        fecha: horarioReal ? horarioReal.fecha : j.fecha,
        hora: horarioReal ? horarioReal.hora : "",
        localId: `eq${localIdx}`,
        visitanteId: `eq${visIdx}`,
        golesLocal: resultado ? resultado[0] : 0,
        golesVisitante: resultado ? resultado[1] : 0,
        estado: resultado ? "finalizado" : "programado",
        parte: 1,
        cronometro: { corriendo: false, inicio: null, acumuladoSegundos: resultado ? 5400 : 0 },
        eventos,
      });
    });
  });
  return {
    liga: { nombre: "División de Honor Juvenil · Grupo 2", temporada: "2026-2027" },
    equipos: EQUIPOS_DHJ,
    partidos,
    solicitudes: [],
  };
}

function clonar(d) {
  return JSON.parse(JSON.stringify(d));
}

function iniciales(nombre) {
  if (!nombre) return "?";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Minutos jugados a partir del cronómetro del partido (funciona aunque la pestaña esté cerrada,
// porque se calcula a partir de una marca de tiempo real, no de un contador acumulado en memoria)
function segundosDe(p) {
  const c = p.cronometro;
  if (!c) return 0;
  const acumulado = c.acumuladoSegundos || 0;
  const enCurso = c.corriendo && c.inicio ? (Date.now() - c.inicio) / 1000 : 0;
  return Math.floor(acumulado + enCurso);
}
function minutosDe(p) {
  return Math.floor(segundosDe(p) / 60);
}
function formatoReloj(totalSegundos) {
  const m = Math.floor(totalSegundos / 60);
  const s = totalSegundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function formatearFecha(p) {
  if (!p.fecha) return "Fecha por confirmar";
  return p.hora ? `${p.fecha} · ${p.hora}h` : p.fecha;
}
// Fecha/hora real de inicio del partido, o null si no se conoce con precisión.
function horaProgramadaDe(p) {
  if (!p.fecha) return null;
  const horaStr = p.hora || "00:00";
  const fechaHora = new Date(`${p.fecha}T${horaStr}:00`);
  return isNaN(fechaHora.getTime()) ? null : fechaHora;
}
// Ordena por fecha+hora ascendente (más próximo primero); sin fecha, al final.
function compararPorFechaHora(a, b) {
  const da = a.fecha ? `${a.fecha}T${a.hora || "00:00"}` : "9999-99-99T99:99";
  const db = b.fecha ? `${b.fecha}T${b.hora || "00:00"}` : "9999-99-99T99:99";
  return da.localeCompare(db);
}
// Si no conocemos la hora prevista, no podemos restringir y se deja iniciar.
function puedeIniciarAhora(p) {
  const prog = horaProgramadaDe(p);
  if (!prog) return true;
  return Date.now() >= prog.getTime();
}

function calcularClasificacion(equipos, partidos) {
  const tabla = {};
  equipos.forEach((e) => {
    tabla[e.id] = { id: e.id, nombre: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
  });
  partidos
    .filter((p) => p.estado === "finalizado")
    .forEach((p) => {
      const h = tabla[p.localId];
      const a = tabla[p.visitanteId];
      if (!h || !a) return;
      h.pj++; a.pj++;
      h.gf += p.golesLocal; h.gc += p.golesVisitante;
      a.gf += p.golesVisitante; a.gc += p.golesLocal;
      if (p.golesLocal > p.golesVisitante) { h.pg++; h.pts += 3; a.pp++; }
      else if (p.golesLocal < p.golesVisitante) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; a.pe++; h.pts += 1; a.pts += 1; }
    });
  return Object.values(tabla).sort(
    (x, y) => y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf || x.nombre.localeCompare(y.nombre)
  );
}

function calcularGoleadores(equipos, partidos) {
  const nombreEquipo = (id) => equipos.find((e) => e.id === id)?.nombre || "";
  const tabla = {};
  partidos.forEach((p) => {
    (p.eventos || []).forEach((ev) => {
      if (ev.tipo !== "gol" || !ev.jugador || !ev.jugador.trim()) return;
      const clave = `${ev.equipoId}__${ev.jugador.trim().toLowerCase()}`;
      if (!tabla[clave]) {
        tabla[clave] = { jugador: ev.jugador.trim(), equipoId: ev.equipoId, equipo: nombreEquipo(ev.equipoId), goles: 0 };
      }
      tabla[clave].goles += 1;
    });
  });
  return Object.values(tabla).sort((x, y) => y.goles - x.goles || x.jugador.localeCompare(y.jugador));
}

const ESTILOS = `
.liga-app {
  --paper: #EDE6D6;
  --paper-dark: #E1D7BF;
  --ink: #1F2A24;
  --ink-soft: #55645A;
  --pitch: #2F6E44;
  --pitch-dark: #1E4A2E;
  --gold: #C99A3B;
  --red: #A83A2E;
  --azul: #2C5F8A;
  --morado: #6B4E82;
  --gris: #5C6B62;
  --line: rgba(31,42,36,0.2);
  font-family: 'Source Serif 4', Georgia, serif;
  background: var(--paper);
  color: var(--ink);
  min-height: 100vh;
  width: 100%;
}
.liga-app * { box-sizing: border-box; }
.liga-stripes {
  height: 14px;
  width: 100%;
  background: repeating-linear-gradient(90deg, var(--pitch) 0px, var(--pitch) 22px, var(--pitch-dark) 22px, var(--pitch-dark) 44px);
}
.liga-masthead {
  padding: 22px 20px 16px;
  border-bottom: 3px double var(--ink);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.liga-titulo {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(24px, 5vw, 34px);
  line-height: 1;
  letter-spacing: -0.01em;
  margin: 0;
}
.liga-subtitulo {
  font-size: 13px;
  color: var(--ink-soft);
  margin-top: 4px;
}
.liga-candado-btn {
  background: transparent;
  border: 1.5px solid var(--ink);
  border-radius: 3px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  color: var(--ink);
}
.liga-candado-btn.desbloqueado { background: var(--pitch); border-color: var(--pitch); color: var(--paper); }
.liga-visitas {
  font-size: 12px; font-weight: 700; color: var(--ink); white-space: nowrap;
  border: 1.5px solid var(--ink); border-radius: 4px; padding: 6px 10px; background: var(--paper-dark);
}
.liga-barra-admin { background: var(--gold); padding: 8px 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.liga-fila-editable { border-bottom: 1px dashed var(--line); }
.liga-fila-editable:last-child { border-bottom: none; }
.liga-fila-editable .liga-fila-compacta { border-bottom: none; }
.liga-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  background: var(--paper-dark);
}
.liga-tab {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: var(--ink-soft);
  white-space: nowrap;
}
.liga-tab.activa { color: var(--ink); border-bottom-color: var(--pitch); }
.liga-contenido { padding: 18px 16px 60px; max-width: 780px; margin: 0 auto; }
.liga-seccion-titulo {
  font-family: 'Archivo Black', sans-serif;
  font-size: 15px;
  margin: 26px 0 10px;
  color: var(--ink);
}
.liga-seccion-titulo:first-child { margin-top: 0; }
.liga-gate-overlay {
  position: fixed; inset: 0; background: rgba(31,42,36,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px;
}
.liga-gate-card {
  background: var(--paper); border: 2px solid var(--ink); border-radius: 4px;
  padding: 20px; width: 100%; max-width: 320px;
}
.liga-input {
  width: 100%; padding: 9px 10px; border: 1.5px solid var(--line); border-radius: 3px;
  background: #fff; font-family: inherit; font-size: 14px; color: var(--ink);
}
.liga-btn {
  background: var(--pitch); color: var(--paper); border: none; border-radius: 3px;
  padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.liga-btn.secundario { background: transparent; color: var(--ink); border: 1.5px solid var(--ink); }
.liga-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.liga-error { color: var(--red); font-size: 12.5px; margin-top: 8px; }
.liga-link { background: none; border: none; padding: 0; color: var(--pitch); font-weight: 700; text-decoration: underline; cursor: pointer; font-family: inherit; font-size: inherit; }
.liga-solicitud-fila { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.liga-solicitud-fila:last-of-type { border-bottom: none; }
.liga-clave-mostrada {
  font-family: 'Archivo Black', sans-serif; font-size: 26px; letter-spacing: 0.06em;
  background: var(--paper-dark); border: 1.5px dashed var(--pitch); border-radius: 4px;
  padding: 12px; text-align: center; margin-bottom: 14px; color: var(--pitch-dark);
}
.liga-opcion-partido {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 11px 12px; border: 1.5px solid var(--line); border-radius: 4px; background: #fff;
  font-family: inherit; font-size: 13.5px; color: var(--ink); cursor: pointer; text-align: left;
}
.liga-opcion-partido:hover { border-color: var(--pitch); }
.liga-opcion-partido.cubierto { opacity: 0.55; cursor: not-allowed; background: var(--paper-dark); }
.liga-marcador {
  background: var(--ink); color: var(--paper); border-radius: 8px; padding: 18px 16px;
  margin-bottom: 14px; position: relative; overflow: hidden;
}
.liga-tag-estado {
  position: absolute; top: 14px; right: 14px; color: #fff;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em; padding: 3px 9px; border-radius: 10px;
}
.liga-tag-estado.en-juego { background: var(--red); animation: liga-pulso 1.8s ease-in-out infinite; }
.liga-tag-estado.descanso { background: var(--gris); }
@keyframes liga-pulso { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
.liga-jornada-txt { text-align: center; font-size: 11.5px; color: #C8CFC9; margin-bottom: 8px; }
.liga-cronometro-grande {
  text-align: center; font-family: 'Archivo Black', sans-serif;
  font-size: clamp(38px, 11vw, 54px); line-height: 1; letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums; color: var(--gold); margin-bottom: 6px;
}
.liga-cronometro-grande.pausado { color: #9BA69E; }
.liga-marcador-equipos {
  display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0 12px;
}
.liga-equipo-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.liga-escudo {
  width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.35);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Archivo Black', sans-serif; font-size: 13px; color: var(--paper);
}
.liga-marcador-nombre {
  font-family: 'Archivo Black', sans-serif; font-size: clamp(12px, 3.4vw, 15px);
  text-align: center; line-height: 1.15; max-width: 100px;
}
.liga-incidencias-equipo { display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: 4px; min-height: 4px; width: 100%; }
.liga-incidencia { font-size: 11px; color: #D8DED9; max-width: 105px; text-align: center; line-height: 1.3; }
.liga-marcador-centro { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.liga-marcador-num-row { display: flex; align-items: center; gap: 10px; }
.liga-marcador-num { font-family: 'Archivo Black', sans-serif; font-size: clamp(30px, 9vw, 42px); color: var(--gold); line-height: 1; }
.liga-marcador-sep { font-size: 20px; color: #8A968E; }
.liga-minuto { font-size: 13px; font-weight: 700; color: var(--red); }
.liga-eventos-lista { list-style: none; margin: 10px 0 0; padding: 0; border-top: 1px solid rgba(255,255,255,0.15); }
.liga-eventos-lista li { padding: 6px 2px; font-size: 13px; display: flex; gap: 8px; align-items: baseline; }
.liga-min { color: var(--gold); font-weight: 700; min-width: 34px; }
.liga-controles { margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.25); display: flex; flex-direction: column; gap: 9px; }
.liga-boton-grande {
  width: 100%; border: none; border-radius: 8px; padding: 15px 12px; color: #fff;
  font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: 'Source Serif 4', Georgia, serif;
}
.liga-boton-grande.verde { background: var(--pitch); }
.liga-boton-grande.azul { background: var(--azul); }
.liga-boton-grande.ambar { background: var(--gold); color: var(--ink); }
.liga-boton-grande.morado { background: var(--morado); }
.liga-boton-grande.gris { background: var(--gris); }
.liga-boton-grande.rojo { background: var(--red); }
.liga-boton-grande.fantasma { background: transparent; border: 1.5px solid rgba(255,255,255,0.4); font-size: 13px; padding: 10px; }
.liga-subbotones { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.liga-fila-compacta {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 4px; border-bottom: 1px dashed var(--line);
}
.liga-fila-compacta:last-child { border-bottom: none; }
.liga-proximo-card {
  border: 1px solid var(--line); border-radius: 6px; padding: 14px; margin-bottom: 10px; background: var(--paper-dark);
}
.liga-jornada-acordeon { border: 1px solid var(--line); border-radius: 6px; margin-bottom: 8px; overflow: hidden; background: var(--paper-dark); }
.liga-jornada-cabecera {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  background: none; border: none; padding: 12px 14px; cursor: pointer; font-family: inherit; color: var(--ink);
}
.liga-jornada-titulo-btn { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 14px; }
.liga-jornada-resumen { font-size: 11.5px; color: var(--ink-soft); }
.liga-jornada-cuerpo { padding: 0 14px 6px; background: var(--paper); }
.liga-vs { font-size: 13.5px; }
.liga-badge {
  font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 10px; white-space: nowrap;
}
.liga-badge.programado { background: var(--paper-dark); color: var(--ink-soft); }
.liga-badge.finalizado { background: var(--pitch); color: var(--paper); }
.liga-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
.liga-tabla th { background: var(--pitch); color: var(--paper); font-size: 11px; padding: 8px 6px; text-align: center; }
.liga-tabla th:nth-child(2), .liga-tabla td:nth-child(2) { text-align: left; padding-left: 6px; }
.liga-tabla th:first-child, .liga-tabla td:first-child { width: 22px; padding-right: 0; }
.liga-tabla td { padding: 8px 6px; text-align: center; border-bottom: 1px solid var(--line); }
.liga-tabla tr:nth-child(even) td { background: var(--paper-dark); }
.liga-vacio { color: var(--ink-soft); font-size: 13.5px; padding: 16px 4px; text-align: center; }
.liga-form { background: var(--paper-dark); border: 1px solid var(--line); border-radius: 4px; padding: 14px; margin-bottom: 18px; }
.liga-form-titulo { font-weight: 700; font-size: 13px; margin-bottom: 10px; }
.liga-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (max-width: 420px) { .liga-grid2 { grid-template-columns: 1fr; } }
.liga-equipo-fila { display: flex; align-items: center; justify-content: space-between; padding: 10px 4px; border-bottom: 1px solid var(--line); font-size: 14.5px; }
.liga-x-btn { background: none; border: none; color: var(--red); cursor: pointer; padding: 4px; display: flex; }
`;

export default function App() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pestaña, setPestaña] = useState("vivo");
  const [desbloqueado, setDesbloqueado] = useState(false);
  const desbloqueadoRef = useRef(false);
  useEffect(() => { desbloqueadoRef.current = desbloqueado; }, [desbloqueado]);
  const [partidoPermitido, setPartidoPermitido] = useState(null); // id del único partido que un ayudante puede editar
  const [mostrarGate, setMostrarGate] = useState(false);
  const [pasoGate, setPasoGate] = useState("pregunta"); // 'pregunta' | 'elegirPartido' | 'solicitar' | 'codigo' | 'confirmado'
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [claveGenerada, setClaveGenerada] = useState("");
  const [avisoCubierto, setAvisoCubierto] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [errorGate, setErrorGate] = useState("");
  const [mostrarSolicitudes, setMostrarSolicitudes] = useState(false);
  const [visitas, setVisitas] = useState(null);

  const cargar = useCallback(async (silencioso) => {
    try {
      const res = await fetch("/api/liga-data", {
        headers: desbloqueadoRef.current ? { "x-clave-organizador": CODIGO_EDICION } : {},
      });
      const texto = await res.text();
      if (texto) {
        setDatos(JSON.parse(texto));
      } else if (!silencioso) {
        const demo = datosDemo();
        setDatos(demo);
        await fetch("/api/liga-data", { method: "POST", body: JSON.stringify(demo) });
      }
    } catch (e) {
      if (!silencioso) setDatos(datosDemo());
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  // Lee el dato tal cual está guardado justo en este instante (no el que ya tenemos en memoria,
  // que puede llevar hasta 15s desfasado). Se usa antes de escrituras sensibles a carreras,
  // como añadir o quitar una solicitud de colaboración.
  const leerDatosFrescos = async () => {
    try {
      const res = await fetch("/api/liga-data", {
        headers: desbloqueadoRef.current ? { "x-clave-organizador": CODIGO_EDICION } : {},
      });
      const texto = await res.text();
      if (texto) return JSON.parse(texto);
    } catch (e) {
      /* si falla, usamos lo que tengamos en memoria */
    }
    return clonar(datos);
  };

  const leerVisitas = useCallback(async () => {
    try {
      const res = await fetch("/api/visitas");
      const texto = await res.text();
      setVisitas(parseInt(texto, 10) || 0);
    } catch (e) {
      /* no pasa nada si falla, solo es un contador informativo */
    }
  }, []);

  const registrarVisita = useCallback(async () => {
    try {
      const res = await fetch("/api/visitas", { method: "POST" });
      const texto = await res.text();
      setVisitas(parseInt(texto, 10) || 0);
    } catch (e) {
      /* no pasa nada si falla, solo es un contador informativo */
    }
  }, []);

  useEffect(() => {
    cargar(false);
    registrarVisita(); // cuenta una vez por carga de la página
    const iv = setInterval(() => cargar(true), 15000);
    const ivVisitas = setInterval(leerVisitas, 15000); // solo lectura, no vuelve a contar
    return () => { clearInterval(iv); clearInterval(ivVisitas); };
  }, [cargar, registrarVisita, leerVisitas]);

  const guardar = async (nuevo) => {
    setDatos(nuevo);
    try {
      await fetch("/api/liga-data", { method: "POST", body: JSON.stringify(nuevo) });
    } catch (e) {
      console.error("Error guardando datos", e);
    }
  };

  if (cargando || !datos) {
    return (
      <div className="liga-app" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <style>{ESTILOS}</style>
        <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Cargando la liga…</p>
      </div>
    );
  }

  const { equipos, partidos, liga } = datos;
  const solicitudes = datos.solicitudes || [];
  const nombreEquipo = (id) => equipos.find((e) => e.id === id)?.nombre || "Equipo eliminado";

  const buscarPartido = (nuevo, id) => nuevo.partidos.find((x) => x.id === id);

  // ---- Mutaciones ----
  // Todas leen el dato tal cual está guardado justo antes de escribir (no el que ya
  // tuviéramos en memoria, que puede llevar hasta 15s desfasado). Así, si dos personas
  // guardan casi a la vez, no se pisan los cambios de la otra.
  const añadirEquipo = async (nombre) => {
    if (!nombre.trim()) return;
    const nuevo = await leerDatosFrescos();
    nuevo.equipos.push({ id: uid(), nombre: nombre.trim() });
    guardar(nuevo);
  };
  const eliminarEquipo = async (id) => {
    const nuevo = await leerDatosFrescos();
    nuevo.equipos = nuevo.equipos.filter((e) => e.id !== id);
    guardar(nuevo);
  };
  const añadirPartido = async (form) => {
    if (!form.localId || !form.visitanteId || form.localId === form.visitanteId) return;
    const nuevo = await leerDatosFrescos();
    nuevo.partidos.push({
      id: uid(),
      jornada: Number(form.jornada) || 1,
      fecha: form.fecha || "",
      localId: form.localId,
      visitanteId: form.visitanteId,
      golesLocal: 0,
      golesVisitante: 0,
      estado: "programado",
      parte: 1,
      cronometro: { corriendo: false, inicio: null, acumuladoSegundos: 0 },
      eventos: [],
    });
    guardar(nuevo);
  };
  const eliminarPartido = async (id) => {
    const nuevo = await leerDatosFrescos();
    nuevo.partidos = nuevo.partidos.filter((p) => p.id !== id);
    guardar(nuevo);
  };

  // Un solo botón "marcha/paro" que recorre: iniciar partido -> descanso -> iniciar 2ª parte (desde el min. 45) -> descanso/reanudar normal
  const alternarCronometro = async (id) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, id);
    if (!p) return;
    if (p.estado === "programado") {
      if (!desbloqueado && !puedeIniciarAhora(p)) {
        const prog = horaProgramadaDe(p);
        const horaTxt = prog
          ? prog.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "la hora prevista";
        window.alert(`Este partido no empieza hasta ${horaTxt}. No se puede iniciar antes.`);
        return;
      }
      p.estado = "en_vivo";
      p.parte = 1;
      p.cronometro = { corriendo: true, inicio: Date.now(), acumuladoSegundos: 0 };
    } else if (p.cronometro && p.cronometro.corriendo) {
      const transcurrido = p.cronometro.inicio ? (Date.now() - p.cronometro.inicio) / 1000 : 0;
      p.cronometro = { corriendo: false, inicio: null, acumuladoSegundos: (p.cronometro.acumuladoSegundos || 0) + transcurrido };
    } else if ((p.parte || 1) === 1) {
      p.parte = 2;
      p.cronometro = { corriendo: true, inicio: Date.now(), acumuladoSegundos: 45 * 60 };
    } else {
      p.cronometro = { ...p.cronometro, corriendo: true, inicio: Date.now() };
    }
    guardar(nuevo);
  };
  const finalizarPartido = async (id) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, id);
    if (!p) return;
    if (p.cronometro && p.cronometro.corriendo && p.cronometro.inicio) {
      const transcurrido = (Date.now() - p.cronometro.inicio) / 1000;
      p.cronometro = { corriendo: false, inicio: null, acumuladoSegundos: (p.cronometro.acumuladoSegundos || 0) + transcurrido };
    }
    p.estado = "finalizado";
    guardar(nuevo);
  };

  const añadirEventoInterno = (nuevo, partidoId, ev) => {
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    p.eventos = p.eventos || [];
    p.eventos.push({ ...ev, id: uid() });
    if (ev.tipo === "gol") {
      if (ev.equipoId === p.localId) p.golesLocal = (p.golesLocal || 0) + 1;
      else if (ev.equipoId === p.visitanteId) p.golesVisitante = (p.golesVisitante || 0) + 1;
    }
  };
  const registrarGol = async (partidoId, equipoId) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    añadirEventoInterno(nuevo, partidoId, { tipo: "gol", equipoId, minuto: minutosDe(p) });
    guardar(nuevo);
  };
  const registrarTarjeta = async (partidoId, equipoId, color) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    añadirEventoInterno(nuevo, partidoId, { tipo: color, equipoId, minuto: minutosDe(p) });
    guardar(nuevo);
  };
  const registrarCambio = async (partidoId, equipoId) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    añadirEventoInterno(nuevo, partidoId, { tipo: "cambio", equipoId, minuto: minutosDe(p) });
    guardar(nuevo);
  };
  const deshacerEvento = async (partidoId) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p || !p.eventos || !p.eventos.length) return;
    const ultimo = p.eventos.pop();
    if (ultimo.tipo === "gol") {
      if (ultimo.equipoId === p.localId) p.golesLocal = Math.max(0, (p.golesLocal || 0) - 1);
      else if (ultimo.equipoId === p.visitanteId) p.golesVisitante = Math.max(0, (p.golesVisitante || 0) - 1);
    }
    guardar(nuevo);
  };

  // --- Corrección manual (solo organizador): permite arreglar cualquier dato si algo salió mal ---
  const actualizarPartidoManual = async (id, cambios) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, id);
    if (!p) return;
    Object.assign(p, cambios);
    guardar(nuevo);
  };
  const eliminarEventoManual = async (partidoId, eventoId) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    p.eventos = (p.eventos || []).filter((e) => e.id !== eventoId);
    guardar(nuevo);
  };
  const añadirEventoManual = async (partidoId, evento) => {
    const nuevo = await leerDatosFrescos();
    const p = buscarPartido(nuevo, partidoId);
    if (!p) return;
    p.eventos = p.eventos || [];
    p.eventos.push({ ...evento, id: uid() });
    guardar(nuevo);
  };

  // Aplica de golpe los resultados/goleadores/horarios reales ya conocidos (Sofascore),
  // sin tocar ningún partido que ya tenga marcador, eventos o estado distinto de "programado"
  // (para no pisar nada que ya se haya jugado o corregido a mano).
  const aplicarResultadosConocidos = async () => {
    const nuevo = await leerDatosFrescos();
    let aplicados = 0;
    (nuevo.partidos || []).forEach((p) => {
      const localIdx = Number((p.localId || "").replace("eq", ""));
      const visIdx = Number((p.visitanteId || "").replace("eq", ""));
      const clave = `${localIdx}-${visIdx}`;
      const horario = p.jornada === 2 ? HORARIOS_J2[clave] : p.jornada === 3 ? HORARIOS_J3[clave] : null;
      if (horario) {
        p.fecha = horario.fecha;
        p.hora = horario.hora;
      }
      const resultado = p.jornada === 1 ? RESULTADOS_J1[clave] : p.jornada === 2 ? RESULTADOS_J2[clave] : null;
      const eventosReales = p.jornada === 1 ? EVENTOS_J1[clave] : p.jornada === 2 ? EVENTOS_J2[clave] : null;
      if (!resultado) return;

      let tocado = false;
      // Marcador y estado: solo si el partido sigue tal cual, sin nada metido a mano todavía.
      if (p.estado === "programado" && (p.golesLocal || 0) === 0 && (p.golesVisitante || 0) === 0) {
        p.golesLocal = resultado[0];
        p.golesVisitante = resultado[1];
        p.estado = "finalizado";
        tocado = true;
      }
      // Goleadores: independiente de lo anterior. Si ya se metió el marcador a mano pero
      // sin los goles uno a uno, esto los rellena igualmente.
      if ((!p.eventos || p.eventos.length === 0) && eventosReales) {
        p.eventos = eventosReales.map((ev) => ({
          id: uid(),
          minuto: ev.minuto,
          tipo: ev.tipo,
          equipoId: ev.equipo === "local" ? p.localId : p.visitanteId,
          jugador: ev.jugador,
        }));
        tocado = true;
      }
      if (tocado) aplicados += 1;
    });
    guardar(nuevo);
    window.alert(aplicados > 0 ? `Aplicados ${aplicados} partidos con datos conocidos.` : "No había ningún partido pendiente al que aplicar datos conocidos.");
  };

  const intentarDesbloquear = () => {
    const valor = codigoInput.trim();
    if (valor === CODIGO_EDICION) {
      setDesbloqueado(true);
      setPartidoPermitido(null);
      setPestaña("vivo");
      cerrarGate();
      return;
    }
    const partidoConClave = partidos.find((p) => p.ayudanteClave && p.ayudanteClave === valor.toUpperCase());
    if (partidoConClave) {
      setPartidoPermitido(partidoConClave.id);
      setDesbloqueado(false);
      setPestaña("vivo");
      cerrarGate();
      return;
    }
    setErrorGate("Código incorrecto. Pregunta al organizador de la liga.");
  };

  const cerrarGate = () => {
    setMostrarGate(false);
    setPasoGate("pregunta");
    setCodigoInput("");
    setEmailInput("");
    setErrorGate("");
    setPartidoSeleccionado(null);
    setAvisoCubierto("");
    setClaveGenerada("");
  };

  const elegirPartidoParaAyudar = (partidoId) => {
    if (partidoCubierto(partidoId)) {
      setAvisoCubierto("Gracias, pero ese partido ya tiene ayudante. Elige otro de la lista.");
      return;
    }
    setPartidoSeleccionado(partidoId);
    setAvisoCubierto("");
    setPasoGate("solicitar");
  };

  const enviarSolicitud = async () => {
    const correo = emailInput.trim();
    if (!correo || !correo.includes("@")) {
      setErrorGate("Escribe un email válido.");
      return;
    }
    if (!partidoSeleccionado || partidoCubierto(partidoSeleccionado)) {
      setErrorGate("Ese partido ya no está disponible, vuelve atrás y elige otro.");
      return;
    }
    const clave = Math.random().toString(36).slice(2, 7).toUpperCase();
    // Leemos el dato más reciente justo antes de guardar (no el que ya teníamos en memoria,
    // que puede llevar hasta 15s desfasado) para no pisar cambios de otros mientras tanto.
    const actual = await leerDatosFrescos();
    const partido = (actual.partidos || []).find((x) => x.id === partidoSeleccionado);
    if (!partido || partido.ayudanteEmail) {
      setErrorGate("Ese partido ya no está disponible, vuelve atrás y elige otro.");
      return;
    }
    // El ayudante se guarda en el propio partido: es la fuente principal de verdad,
    // así no depende de un array aparte que se pueda perder por una escritura simultánea.
    partido.ayudanteEmail = correo;
    partido.ayudanteClave = clave;
    actual.solicitudes = actual.solicitudes || [];
    actual.solicitudes.push({ id: uid(), email: correo, partidoId: partidoSeleccionado, clave, fecha: Date.now() });
    guardar(actual);
    // Autoservicio: se concede acceso al instante, pero SOLO para el partido elegido
    setPartidoPermitido(partidoSeleccionado);
    setDesbloqueado(false);
    setPestaña("vivo");
    setClaveGenerada(clave);
    setPasoGate("confirmado");
    setErrorGate("");
  };

  const liberarAyudante = async (partidoId) => {
    const actual = await leerDatosFrescos();
    const partido = (actual.partidos || []).find((x) => x.id === partidoId);
    if (partido) {
      delete partido.ayudanteEmail;
      delete partido.ayudanteClave;
    }
    actual.solicitudes = (actual.solicitudes || []).filter((s) => s.partidoId !== partidoId);
    guardar(actual);
  };

  const enVivo = partidos.filter((p) => p.estado === "en_vivo").sort((a, b) => a.jornada - b.jornada);
  const proximos = partidos.filter((p) => p.estado === "programado").sort((a, b) => a.jornada - b.jornada);
  const finalizados = partidos.filter((p) => p.estado === "finalizado").sort((a, b) => b.jornada - a.jornada);
  const clasificacion = calcularClasificacion(equipos, partidos);
  const goleadores = calcularGoleadores(equipos, partidos);

  // Solo se puede solicitar ayuda para partidos de la jornada más próxima sin jugar
  const jornadaParaSolicitudes = proximos.length ? Math.min(...proximos.map((p) => p.jornada)) : null;
  const partidosParaSolicitudes = proximos.filter((p) => p.jornada === jornadaParaSolicitudes);
  const partidoCubierto = (partidoId) => {
    const partido = partidos.find((p) => p.id === partidoId);
    return !!(partido && partido.ayudanteEmail);
  };
  const modoRestringido = desbloqueado || !!partidoPermitido;
  const puedeEditar = (partidoId) => desbloqueado || partidoPermitido === partidoId;

  return (
    <div className="liga-app">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap');`}</style>
      <style>{ESTILOS}</style>

      <div className="liga-stripes" />
      <div className="liga-masthead">
        <div>
          <p className="liga-titulo">{liga.nombre}</p>
          <p className="liga-subtitulo">Temporada {liga.temporada} · resultados en directo desde la grada</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {desbloqueado && (
            <button className="liga-candado-btn" onClick={() => setMostrarSolicitudes(true)}>
              Ayudantes{(() => { const n = partidos.filter((p) => p.ayudanteEmail).length; return n > 0 ? ` (${n})` : ""; })()}
            </button>
          )}
          <button
            className={`liga-candado-btn ${modoRestringido ? "desbloqueado" : ""}`}
            onClick={() => {
              if (desbloqueado) setDesbloqueado(false);
              else if (partidoPermitido) setPartidoPermitido(null);
              else setMostrarGate(true);
            }}
          >
            {modoRestringido ? <Unlock size={15} /> : <Lock size={15} />}
            {desbloqueado ? "Modo edición" : partidoPermitido ? "Ayudando en 1 partido" : "Ayudante"}
          </button>
          {desbloqueado && (
            <span className="liga-visitas" title="Visitas totales a la web">
              {visitas === null ? "…" : visitas}
            </span>
          )}
        </div>
      </div>

      {desbloqueado && (
        <div className="liga-barra-admin">
          <button className="liga-btn secundario" onClick={() => setPestaña(pestaña === "editor" ? "vivo" : "editor")}>
            {pestaña === "editor" ? <>← Volver a En vivo</> : <><Pencil size={13} /> Editar todo (corregir errores)</>}
          </button>
          {pestaña === "editor" && (
            <button
              className="liga-btn secundario"
              onClick={() => { if (window.confirm("Esto rellena fecha/hora/marcador/goleadores conocidos en los partidos que aún estén sin tocar. ¿Continuar?")) aplicarResultadosConocidos(); }}
            >
              Aplicar resultados conocidos (Sofascore)
            </button>
          )}
        </div>
      )}

      <div className="liga-tabs">
        {(modoRestringido
          ? [["vivo", "En vivo"]]
          : [
              ["vivo", "En vivo"],
              ["calendario", "Calendario"],
              ["clasificacion", "Clasificación"],
              ["goleadores", "Goleadores"],
              ["equipos", "Equipos"],
            ]
        ).map(([key, label]) => (
          <button key={key} className={`liga-tab ${pestaña === key ? "activa" : ""}`} onClick={() => setPestaña(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="liga-contenido">
        {((modoRestringido && pestaña !== "editor") ? "vivo" : pestaña) === "vivo" && (
          <VistaVivo
            enVivo={enVivo}
            proximos={proximos}
            finalizados={finalizados}
            nombreEquipo={nombreEquipo}
            desbloqueado={desbloqueado}
            puedeEditar={puedeEditar}
            alternarCronometro={alternarCronometro}
            finalizarPartido={finalizarPartido}
            registrarGol={registrarGol}
            registrarTarjeta={registrarTarjeta}
            registrarCambio={registrarCambio}
            deshacerEvento={deshacerEvento}
          />
        )}
        {!modoRestringido && pestaña === "calendario" && (
          <VistaCalendario
            partidos={partidos}
            equipos={equipos}
            nombreEquipo={nombreEquipo}
            desbloqueado={desbloqueado}
            añadirPartido={añadirPartido}
            eliminarPartido={eliminarPartido}
            actualizarPartidoManual={actualizarPartidoManual}
            eliminarEventoManual={eliminarEventoManual}
            añadirEventoManual={añadirEventoManual}
          />
        )}
        {!modoRestringido && pestaña === "clasificacion" && <VistaClasificacion tabla={clasificacion} />}
        {!modoRestringido && pestaña === "goleadores" && <VistaGoleadores tabla={goleadores} />}
        {!modoRestringido && pestaña === "equipos" && (
          <VistaEquipos equipos={equipos} desbloqueado={desbloqueado} añadirEquipo={añadirEquipo} eliminarEquipo={eliminarEquipo} />
        )}
        {desbloqueado && pestaña === "editor" && (
          <div>
            <p className="liga-seccion-titulo">Editor completo (organizador)</p>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 4 }}>
              Aquí puedes corregir cualquier dato: equipos, calendario, marcadores, estado del
              partido y la lista de goles/tarjetas de cada uno.
            </p>
            <VistaEquipos equipos={equipos} desbloqueado={desbloqueado} añadirEquipo={añadirEquipo} eliminarEquipo={eliminarEquipo} />
            <VistaCalendario
              partidos={partidos}
              equipos={equipos}
              nombreEquipo={nombreEquipo}
              desbloqueado={desbloqueado}
              añadirPartido={añadirPartido}
              eliminarPartido={eliminarPartido}
              actualizarPartidoManual={actualizarPartidoManual}
              eliminarEventoManual={eliminarEventoManual}
              añadirEventoManual={añadirEventoManual}
            />
          </div>
        )}
      </div>

      {mostrarGate && (
        <div className="liga-gate-overlay" onClick={cerrarGate}>
          <div className="liga-gate-card" onClick={(e) => e.stopPropagation()}>
            {pasoGate === "pregunta" && (
              <>
                <p style={{ fontWeight: 700, marginBottom: 10 }}>¿Quieres colaborar registrando los partidos en directo?</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
                  Eliges un partido de la jornada actual que todavía no tenga ayudante, dejas tu
                  email y al instante te damos una clave que solo sirve para ese partido. Con ella
                  podrás marcar goles, tarjetas y cambios mientras ves el encuentro desde la grada.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="liga-btn" onClick={() => setPasoGate("elegirPartido")}>Sí, quiero colaborar</button>
                  <button className="liga-btn secundario" onClick={cerrarGate}>No, solo quiero ver</button>
                </div>
                <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 14 }}>
                  ¿Ya tienes una clave? <button className="liga-link" onClick={() => setPasoGate("codigo")}>Introdúcela aquí</button>
                </p>
              </>
            )}

            {pasoGate === "elegirPartido" && (
              <>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>¿Con qué partido quieres ayudar?</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10 }}>
                  {partidosParaSolicitudes.length > 0 ? `Jornada ${jornadaParaSolicitudes}` : "No hay partidos disponibles ahora mismo."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                  {partidosParaSolicitudes.map((p) => {
                    const cubierto = partidoCubierto(p.id);
                    return (
                      <button
                        key={p.id}
                        className={`liga-opcion-partido ${cubierto ? "cubierto" : ""}`}
                        onClick={() => elegirPartidoParaAyudar(p.id)}
                      >
                        <span>{nombreEquipo(p.localId)} vs {nombreEquipo(p.visitanteId)}</span>
                        {cubierto && <span className="liga-badge finalizado">Cubierto</span>}
                      </button>
                    );
                  })}
                </div>
                {avisoCubierto && <p className="liga-error">{avisoCubierto}</p>}
                <button className="liga-btn secundario" style={{ marginTop: 12 }} onClick={() => { setPasoGate("pregunta"); setAvisoCubierto(""); }}>‹ Volver</button>
              </>
            )}

            {pasoGate === "solicitar" && (
              <>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Pide tu clave de colaborador</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10 }}>
                  {partidoSeleccionado && (
                    <>Vas a ayudar con <strong>{nombreEquipo(partidos.find((x) => x.id === partidoSeleccionado)?.localId)} vs {nombreEquipo(partidos.find((x) => x.id === partidoSeleccionado)?.visitanteId)}</strong>. </>
                  )}
                  Déjanos tu email para que quede registrado quién ayuda con cada partido, y te damos la clave al instante.
                </p>
                <input
                  className="liga-input"
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarSolicitud()}
                  autoFocus
                />
                {errorGate && <p className="liga-error">{errorGate}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="liga-btn" onClick={enviarSolicitud}>Enviar solicitud</button>
                  <button className="liga-btn secundario" onClick={() => setPasoGate("elegirPartido")}>‹ Volver</button>
                </div>
              </>
            )}

            {pasoGate === "codigo" && (
              <>
                <p style={{ fontWeight: 700, marginBottom: 10 }}>Código de colaborador</p>
                <input
                  className="liga-input"
                  type="password"
                  placeholder="Código"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && intentarDesbloquear()}
                  autoFocus
                />
                {errorGate && <p className="liga-error">{errorGate}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="liga-btn" onClick={intentarDesbloquear}>Desbloquear</button>
                  <button className="liga-btn secundario" onClick={() => setPasoGate("pregunta")}>‹ Volver</button>
                </div>
              </>
            )}

            {pasoGate === "confirmado" && (
              <>
                <p style={{ fontWeight: 700, marginBottom: 8 }}>¡Ya puedes colaborar!</p>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12 }}>
                  {partidoSeleccionado && (() => {
                    const pp = partidos.find((x) => x.id === partidoSeleccionado);
                    return pp ? <>Tu acceso es <strong>solo para este partido</strong>: <strong>{nombreEquipo(pp.localId)} vs {nombreEquipo(pp.visitanteId)}</strong>.</> : null;
                  })()}
                </p>
                <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Guarda esta clave por si vuelves a entrar más tarde:</p>
                <p className="liga-clave-mostrada">{claveGenerada}</p>
                <button className="liga-btn" onClick={cerrarGate}>Entendido, ¡a jugar!</button>
              </>
            )}
          </div>
        </div>
      )}

      {mostrarSolicitudes && (
        <div className="liga-gate-overlay" onClick={() => setMostrarSolicitudes(false)}>
          <div className="liga-gate-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Ayudantes registrados</p>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
              Se desbloquean solos al elegir partido; aquí solo queda constancia de quién es cada uno.
            </p>
            {partidos.filter((p) => p.ayudanteEmail).length === 0 && (
              <p className="liga-vacio">Todavía no se ha apuntado nadie.</p>
            )}
            {partidos.filter((p) => p.ayudanteEmail).map((p) => (
              <div key={p.id} className="liga-solicitud-fila">
                <span style={{ fontSize: 13.5 }}>
                  <span style={{ wordBreak: "break-all" }}>{p.ayudanteEmail}</span>
                  <br />
                  <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {nombreEquipo(p.localId)} vs {nombreEquipo(p.visitanteId)}
                    {p.ayudanteClave ? ` · clave ${p.ayudanteClave}` : ""}
                  </span>
                </span>
                <button
                  className="liga-x-btn"
                  title="Liberar este partido para que otra persona pueda apuntarse"
                  onClick={() => liberarAyudante(p.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button className="liga-btn secundario" style={{ marginTop: 14 }} onClick={() => setMostrarSolicitudes(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VistaVivo({
  enVivo, proximos, finalizados, nombreEquipo, desbloqueado, puedeEditar,
  alternarCronometro, finalizarPartido,
  registrarGol, registrarTarjeta, registrarCambio, deshacerEvento,
}) {
  const [partidoEntrado, setPartidoEntrado] = useState(null);

  return (
    <div>
      <p className="liga-seccion-titulo">En directo</p>
      {enVivo.length === 0 && <p className="liga-vacio">No hay partidos en directo ahora mismo.</p>}
      {enVivo.map((p) => (
        <MarcadorPartido
          key={p.id}
          p={p}
          nombreEquipo={nombreEquipo}
          desbloqueado={puedeEditar(p.id)}
          esOrganizador={desbloqueado}
          alternarCronometro={alternarCronometro}
          finalizarPartido={finalizarPartido}
          registrarGol={registrarGol}
          registrarTarjeta={registrarTarjeta}
          registrarCambio={registrarCambio}
          deshacerEvento={deshacerEvento}
        />
      ))}

      <p className="liga-seccion-titulo">Próximos partidos</p>
      {proximos.length === 0 && <p className="liga-vacio">No hay partidos programados.</p>}
      {proximos.length > 0 && (() => {
        const jornadaActual = Math.min(...proximos.map((p) => p.jornada));
        const deEstaJornada = proximos.filter((p) => p.jornada === jornadaActual).sort(compararPorFechaHora);
        const jornadasPendientes = new Set(proximos.map((p) => p.jornada)).size;
        return (
          <>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: -4, marginBottom: 10 }}>
              Jornada {jornadaActual}{jornadasPendientes > 1 ? ` · quedan ${jornadasPendientes} jornadas por jugar (ver Calendario)` : ""}
            </p>
            {deEstaJornada.map((p) => {
              const editable = puedeEditar(p.id);
              return partidoEntrado === p.id ? (
                <MarcadorPartido
                  key={p.id}
                  p={p}
                  nombreEquipo={nombreEquipo}
                  desbloqueado={editable}
                  esOrganizador={desbloqueado}
                  alternarCronometro={alternarCronometro}
                  finalizarPartido={finalizarPartido}
                  registrarGol={registrarGol}
                  registrarTarjeta={registrarTarjeta}
                  registrarCambio={registrarCambio}
                  deshacerEvento={deshacerEvento}
                  onVolver={() => setPartidoEntrado(null)}
                />
              ) : (
                <div key={p.id} className="liga-proximo-card">
                  <div className="liga-vs">{nombreEquipo(p.localId)} vs {nombreEquipo(p.visitanteId)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: editable ? 10 : 0 }}>
                    {formatearFecha(p)}
                  </div>
                  {editable ? (
                    <button className="liga-btn" onClick={() => setPartidoEntrado(p.id)}>
                      Entrar
                    </button>
                  ) : (
                    <span className="liga-badge programado">Programado</span>
                  )}
                </div>
              );
            })}
          </>
        );
      })()}

      <p className="liga-seccion-titulo">Últimos resultados</p>
      {finalizados.length === 0 && <p className="liga-vacio">Todavía no hay resultados.</p>}
      {finalizados.slice(0, 6).map((p) => (
        <div key={p.id} className="liga-fila-compacta">
          <div className="liga-vs">J{p.jornada} · {nombreEquipo(p.localId)} {p.golesLocal} - {p.golesVisitante} {nombreEquipo(p.visitanteId)}</div>
          <span className="liga-badge finalizado">Finalizado</span>
        </div>
      ))}
    </div>
  );
}

function MarcadorPartido({
  p, nombreEquipo, desbloqueado, esOrganizador,
  alternarCronometro, finalizarPartido,
  registrarGol, registrarTarjeta, registrarCambio, deshacerEvento,
  onVolver,
}) {
  const [, forzarRender] = useState(0);
  const [panelAbierto, setPanelAbierto] = useState(null); // 'tarjeta' | 'cambio' | null
  const corriendo = !!(p.cronometro && p.cronometro.corriendo);
  const empezado = p.estado === "en_vivo";

  useEffect(() => {
    if (!corriendo) return;
    const iv = setInterval(() => forzarRender((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [corriendo, p.cronometro?.inicio]);

  const minuto = minutosDe(p);
  const yaPuedeIniciar = esOrganizador || puedeIniciarAhora(p);
  const iconoEvento = (t) => (t === "gol" ? "⚽" : t === "amarilla" ? "🟨" : t === "roja" ? "🟥" : "🔄");
  const nombreLocal = nombreEquipo(p.localId);
  const nombreVisitante = nombreEquipo(p.visitanteId);

  // Marcador acumulado tras cada gol, para mostrar "1-0", "1-1"... en el ticker de eventos
  let gl = 0, gv = 0;
  const eventosConMarcador = (p.eventos || []).map((ev) => {
    if (ev.tipo === "gol") {
      if (ev.equipoId === p.localId) gl++; else if (ev.equipoId === p.visitanteId) gv++;
      return { ...ev, marcador: `${gl}-${gv}` };
    }
    return ev;
  });

  // El botón único cambia de etiqueta según el momento del partido
  let etiquetaBoton = "Iniciar partido";
  let IconoBoton = Play;
  if (empezado) {
    if (corriendo) { etiquetaBoton = "Descanso"; IconoBoton = Pause; }
    else if ((p.parte || 1) === 1) { etiquetaBoton = "Iniciar 2ª parte"; IconoBoton = Play; }
    else { etiquetaBoton = "Reanudar"; IconoBoton = Play; }
  }

  return (
    <div className="liga-marcador">
      <span className={`liga-tag-estado ${empezado ? (corriendo ? "en-juego" : "descanso") : "descanso"}`}>
        {empezado ? (corriendo ? "EN JUEGO" : "DESCANSO") : "POR EMPEZAR"}
      </span>
      <div className={`liga-cronometro-grande ${corriendo ? "" : "pausado"}`}>{formatoReloj(segundosDe(p))}</div>
      <p className="liga-jornada-txt">Jornada {p.jornada}</p>

      <div className="liga-marcador-equipos">
        <div className="liga-equipo-col">
          <span className="liga-escudo">{iniciales(nombreLocal)}</span>
          <span className="liga-marcador-nombre">{nombreLocal}</span>
          <div className="liga-incidencias-equipo">
            {eventosConMarcador.filter((ev) => ev.equipoId === p.localId).map((ev) => (
              <div key={ev.id} className="liga-incidencia">
                {iconoEvento(ev.tipo)} {ev.minuto}'{ev.tipo === "gol" ? ` (${ev.marcador})` : ""}
              </div>
            ))}
          </div>
        </div>
        <div className="liga-marcador-centro">
          <div className="liga-marcador-num-row">
            <span className="liga-marcador-num">{p.golesLocal}</span>
            <span className="liga-marcador-sep">–</span>
            <span className="liga-marcador-num">{p.golesVisitante}</span>
          </div>
          <span className="liga-minuto">{minuto}'</span>
        </div>
        <div className="liga-equipo-col">
          <span className="liga-escudo">{iniciales(nombreVisitante)}</span>
          <span className="liga-marcador-nombre">{nombreVisitante}</span>
          <div className="liga-incidencias-equipo">
            {eventosConMarcador.filter((ev) => ev.equipoId === p.visitanteId).map((ev) => (
              <div key={ev.id} className="liga-incidencia">
                {iconoEvento(ev.tipo)} {ev.minuto}'{ev.tipo === "gol" ? ` (${ev.marcador})` : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {desbloqueado && (
        <div className="liga-controles">
          {empezado && (
            <>
              <button className="liga-boton-grande verde" onClick={() => registrarGol(p.id, p.localId)}>
                ⚽ Gol {nombreLocal}
              </button>
              <button className="liga-boton-grande azul" onClick={() => registrarGol(p.id, p.visitanteId)}>
                ⚽ Gol {nombreVisitante}
              </button>

              <button className="liga-boton-grande ambar" onClick={() => setPanelAbierto(panelAbierto === "tarjeta" ? null : "tarjeta")}>
                🟨 Tarjeta
              </button>
              {panelAbierto === "tarjeta" && (
                <div className="liga-subbotones">
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarTarjeta(p.id, p.localId, "amarilla"); setPanelAbierto(null); }}>🟨 {nombreLocal}</button>
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarTarjeta(p.id, p.visitanteId, "amarilla"); setPanelAbierto(null); }}>🟨 {nombreVisitante}</button>
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarTarjeta(p.id, p.localId, "roja"); setPanelAbierto(null); }}>🟥 {nombreLocal}</button>
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarTarjeta(p.id, p.visitanteId, "roja"); setPanelAbierto(null); }}>🟥 {nombreVisitante}</button>
                </div>
              )}

              <button className="liga-boton-grande morado" onClick={() => setPanelAbierto(panelAbierto === "cambio" ? null : "cambio")}>
                🔄 Cambio
              </button>
              {panelAbierto === "cambio" && (
                <div className="liga-subbotones">
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarCambio(p.id, p.localId); setPanelAbierto(null); }}>{nombreLocal}</button>
                  <button className="liga-boton-grande fantasma" onClick={() => { registrarCambio(p.id, p.visitanteId); setPanelAbierto(null); }}>{nombreVisitante}</button>
                </div>
              )}
            </>
          )}

          {!empezado && !yaPuedeIniciar ? (
            <button className="liga-boton-grande gris" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
              🔒 Empieza a las {p.hora ? `${p.hora}h` : "la hora prevista"}
            </button>
          ) : (
            <button className="liga-boton-grande gris" onClick={() => alternarCronometro(p.id)}>
              <IconoBoton size={16} /> {etiquetaBoton}
            </button>
          )}

          {empezado && (
            <button className="liga-boton-grande rojo" onClick={() => finalizarPartido(p.id)}><CheckCircle2 size={16} /> Final</button>
          )}

          {empezado && p.eventos && p.eventos.length > 0 && (
            <button className="liga-boton-grande fantasma" onClick={() => deshacerEvento(p.id)}><Undo2 size={14} /> Deshacer último evento</button>
          )}

          {onVolver && (
            <button className="liga-boton-grande fantasma" onClick={onVolver}>← Volver a próximos partidos</button>
          )}
        </div>
      )}
    </div>
  );
}

function VistaCalendario({
  partidos, equipos, nombreEquipo, desbloqueado, añadirPartido, eliminarPartido,
  actualizarPartidoManual, eliminarEventoManual, añadirEventoManual,
}) {
  const [jornada, setJornada] = useState("1");
  const [fecha, setFecha] = useState("");
  const [localId, setLocalId] = useState("");
  const [visitanteId, setVisitanteId] = useState("");

  const crear = () => {
    añadirPartido({ jornada, fecha, localId, visitanteId });
    setFecha(""); setLocalId(""); setVisitanteId("");
  };

  const porJornada = {};
  partidos.forEach((p) => {
    porJornada[p.jornada] = porJornada[p.jornada] || [];
    porJornada[p.jornada].push(p);
  });
  Object.values(porJornada).forEach((lista) => lista.sort(compararPorFechaHora));
  const jornadas = Object.keys(porJornada).map(Number).sort((a, b) => a - b);

  // Se abre por defecto la primera jornada que todavía tenga partidos sin finalizar
  const jornadaPorDefecto = jornadas.find((j) => porJornada[j].some((p) => p.estado !== "finalizado")) ?? jornadas[0];
  const [abierta, setAbierta] = useState(jornadaPorDefecto);

  return (
    <div>
      {desbloqueado && (
        <div className="liga-form">
          <p className="liga-form-titulo">Crear partido</p>
          <div className="liga-grid2" style={{ marginBottom: 8 }}>
            <select className="liga-input" value={localId} onChange={(e) => setLocalId(e.target.value)}>
              <option value="">Equipo local…</option>
              {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <select className="liga-input" value={visitanteId} onChange={(e) => setVisitanteId(e.target.value)}>
              <option value="">Equipo visitante…</option>
              {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="liga-grid2" style={{ marginBottom: 10 }}>
            <input className="liga-input" type="number" placeholder="Jornada" value={jornada} onChange={(e) => setJornada(e.target.value)} />
            <input className="liga-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <button className="liga-btn" disabled={!localId || !visitanteId || localId === visitanteId} onClick={crear}>
            <Plus size={13} /> Añadir al calendario
          </button>
          {equipos.length < 2 && <p className="liga-error">Necesitas al menos 2 equipos (pestaña Equipos).</p>}
        </div>
      )}

      {jornadas.length === 0 && <p className="liga-vacio">Aún no hay partidos en el calendario.</p>}
      {jornadas.map((j) => {
        const partidosJ = porJornada[j];
        const jugados = partidosJ.filter((p) => p.estado === "finalizado").length;
        const abiertaAhora = abierta === j;
        return (
          <div key={j} className="liga-jornada-acordeon">
            <button className="liga-jornada-cabecera" onClick={() => setAbierta(abiertaAhora ? null : j)}>
              <span className="liga-jornada-titulo-btn">
                {abiertaAhora ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Jornada {j}
              </span>
              <span className="liga-jornada-resumen">{jugados}/{partidosJ.length} jugados</span>
            </button>
            {abiertaAhora && (
              <div className="liga-jornada-cuerpo">
                {partidosJ.map((p) => (
                  <FilaPartidoCalendario
                    key={p.id}
                    p={p}
                    equipos={equipos}
                    nombreEquipo={nombreEquipo}
                    desbloqueado={desbloqueado}
                    eliminarPartido={eliminarPartido}
                    actualizarPartidoManual={actualizarPartidoManual}
                    eliminarEventoManual={eliminarEventoManual}
                    añadirEventoManual={añadirEventoManual}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FilaPartidoCalendario({
  p, equipos, nombreEquipo, desbloqueado, eliminarPartido,
  actualizarPartidoManual, eliminarEventoManual, añadirEventoManual,
}) {
  const [editando, setEditando] = useState(false);
  const [estado, setEstado] = useState(p.estado);
  const [golesLocal, setGolesLocal] = useState(p.golesLocal);
  const [golesVisitante, setGolesVisitante] = useState(p.golesVisitante);
  const [fecha, setFecha] = useState(p.fecha || "");
  const [hora, setHora] = useState(p.hora || "");

  const [nuevoTipo, setNuevoTipo] = useState("gol");
  const [nuevoEquipo, setNuevoEquipo] = useState(p.localId);
  const [nuevoMinuto, setNuevoMinuto] = useState("");
  const [nuevoJugador, setNuevoJugador] = useState("");

  const abrir = () => {
    setEstado(p.estado);
    setGolesLocal(p.golesLocal);
    setGolesVisitante(p.golesVisitante);
    setFecha(p.fecha || "");
    setHora(p.hora || "");
    setEditando(true);
  };

  const guardarCambios = () => {
    actualizarPartidoManual(p.id, {
      estado,
      golesLocal: Number(golesLocal) || 0,
      golesVisitante: Number(golesVisitante) || 0,
      fecha,
      hora,
    });
    setEditando(false);
  };

  const añadirEvento = () => {
    if (!nuevoMinuto) return;
    añadirEventoManual(p.id, { tipo: nuevoTipo, equipoId: nuevoEquipo, minuto: Number(nuevoMinuto), jugador: nuevoJugador.trim() });
    setNuevoMinuto("");
    setNuevoJugador("");
  };

  return (
    <div className="liga-fila-editable">
      <div className="liga-fila-compacta" style={{ borderBottom: editando ? "none" : undefined }}>
        <div>
          <div className="liga-vs">
            {nombreEquipo(p.localId)} {p.estado === "programado" ? "vs" : `${p.golesLocal} - ${p.golesVisitante}`} {nombreEquipo(p.visitanteId)}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{formatearFecha(p)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`liga-badge ${p.estado === "en_vivo" ? "finalizado" : p.estado}`}>
            {p.estado === "en_vivo" ? "En vivo" : p.estado === "finalizado" ? "Finalizado" : "Programado"}
          </span>
          {desbloqueado && (
            <>
              <button className="liga-x-btn" title="Corregir este partido" onClick={() => (editando ? setEditando(false) : abrir())}>
                <Pencil size={15} />
              </button>
              <button className="liga-x-btn" onClick={() => eliminarPartido(p.id)}><Trash2 size={15} /></button>
            </>
          )}
        </div>
      </div>

      {editando && (
        <div className="liga-form" style={{ marginTop: 0, marginBottom: 14 }}>
          <p className="liga-form-titulo">Corregir partido</p>
          <div className="liga-grid2" style={{ marginBottom: 8 }}>
            <select className="liga-input" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="programado">Programado</option>
              <option value="en_vivo">En vivo</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <div className="liga-grid2" style={{ gap: 8 }}>
              <input className="liga-input" type="number" value={golesLocal} onChange={(e) => setGolesLocal(e.target.value)} placeholder="Goles local" />
              <input className="liga-input" type="number" value={golesVisitante} onChange={(e) => setGolesVisitante(e.target.value)} placeholder="Goles visitante" />
            </div>
          </div>
          <div className="liga-grid2" style={{ marginBottom: 10 }}>
            <input className="liga-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            <input className="liga-input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <button className="liga-btn" onClick={guardarCambios}>Guardar cambios</button>

          <p className="liga-form-titulo" style={{ marginTop: 18 }}>Goles y tarjetas registrados</p>
          {(p.eventos || []).length === 0 && <p className="liga-vacio" style={{ padding: "6px 0" }}>Sin eventos.</p>}
          {(p.eventos || []).map((ev) => (
            <div key={ev.id} className="liga-solicitud-fila">
              <span style={{ fontSize: 13 }}>
                {ev.minuto}' · {ev.tipo === "gol" ? "⚽" : ev.tipo === "amarilla" ? "🟨" : ev.tipo === "roja" ? "🟥" : "🔄"}{" "}
                {ev.jugador ? `${ev.jugador} · ` : ""}{nombreEquipo(ev.equipoId)}
              </span>
              <button className="liga-x-btn" onClick={() => eliminarEventoManual(p.id, ev.id)}><Trash2 size={14} /></button>
            </div>
          ))}

          <p className="liga-form-titulo" style={{ marginTop: 12 }}>Añadir evento</p>
          <div className="liga-grid2" style={{ marginBottom: 8 }}>
            <select className="liga-input" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
              <option value="gol">⚽ Gol</option>
              <option value="amarilla">🟨 Amarilla</option>
              <option value="roja">🟥 Roja</option>
              <option value="cambio">🔄 Cambio</option>
            </select>
            <select className="liga-input" value={nuevoEquipo} onChange={(e) => setNuevoEquipo(e.target.value)}>
              <option value={p.localId}>{nombreEquipo(p.localId)}</option>
              <option value={p.visitanteId}>{nombreEquipo(p.visitanteId)}</option>
            </select>
          </div>
          <div className="liga-grid2" style={{ marginBottom: 8 }}>
            <input className="liga-input" type="number" placeholder="Minuto" value={nuevoMinuto} onChange={(e) => setNuevoMinuto(e.target.value)} />
            <input className="liga-input" type="text" placeholder="Jugador (opcional)" value={nuevoJugador} onChange={(e) => setNuevoJugador(e.target.value)} />
          </div>
          <button className="liga-btn secundario" onClick={añadirEvento}><Plus size={13} /> Añadir evento</button>
        </div>
      )}
    </div>
  );
}

function VistaClasificacion({ tabla }) {
  return (
    <div>
      <p className="liga-seccion-titulo">Clasificación</p>
      {tabla.length === 0 ? (
        <p className="liga-vacio">Añade equipos para ver la clasificación.</p>
      ) : (
        <table className="liga-tabla">
          <thead>
            <tr>
              <th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((t, i) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 700, color: "var(--ink-soft)" }}>{i + 1}.</td>
                <td>{t.nombre}</td>
                <td>{t.pj}</td><td>{t.pg}</td><td>{t.pe}</td><td>{t.pp}</td>
                <td>{t.gf}</td><td>{t.gc}</td><td>{t.gf - t.gc}</td>
                <td style={{ fontWeight: 700 }}>{t.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function VistaGoleadores({ tabla }) {
  return (
    <div>
      <p className="liga-seccion-titulo">Goleadores</p>
      {tabla.length === 0 ? (
        <p className="liga-vacio">
          Todavía no hay datos de goleadores. Se irán completando partido a partido.
        </p>
      ) : (
        <table className="liga-tabla">
          <thead>
            <tr>
              <th>#</th><th>Jugador</th><th>Equipo</th><th>Goles</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((t, i) => (
              <tr key={`${t.equipoId}__${t.jugador}`}>
                <td style={{ fontWeight: 700, color: "var(--ink-soft)" }}>{i + 1}.</td>
                <td>{t.jugador}</td>
                <td>{t.equipo}</td>
                <td style={{ fontWeight: 700 }}>{t.goles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function VistaEquipos({ equipos, desbloqueado, añadirEquipo, eliminarEquipo }) {
  const [nombre, setNombre] = useState("");
  const crear = () => { añadirEquipo(nombre); setNombre(""); };
  return (
    <div>
      {desbloqueado && (
        <div className="liga-form">
          <p className="liga-form-titulo">Añadir equipo</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="liga-input"
              placeholder="Nombre del equipo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crear()}
            />
            <button className="liga-btn" onClick={crear}><Plus size={13} /></button>
          </div>
        </div>
      )}
      <p className="liga-seccion-titulo">Equipos ({equipos.length})</p>
      {equipos.length === 0 && <p className="liga-vacio">Todavía no hay equipos registrados.</p>}
      {equipos.map((e) => (
        <div key={e.id} className="liga-equipo-fila">
          <span>{e.nombre}</span>
          {desbloqueado && (
            <button className="liga-x-btn" onClick={() => eliminarEquipo(e.id)}><Trash2 size={15} /></button>
          )}
        </div>
      ))}
    </div>
  );
}
