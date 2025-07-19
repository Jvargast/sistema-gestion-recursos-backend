import fetch from "node-fetch";

async function obtenerCoordenadasDesdeDireccion(direccion) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      direccion + ", Chile"
    )}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "erp.aguasvalentino.com",
      },
    });

    const data = await res.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (err) {
    console.error("Error al obtener coordenadas:", err);
    return null;
  }
}

export default obtenerCoordenadasDesdeDireccion;
