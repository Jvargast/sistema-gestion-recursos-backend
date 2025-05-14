import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONA_HORARIA = "America/Santiago";


export const obtenerFechaActualChile = () => {
  return dayjs().tz(ZONA_HORARIA).utc().toDate(); // 🔁 CORREGIDO
};

export const obtenerFechaChile = (formato = null) => {
  const now = dayjs().tz(ZONA_HORARIA);
  return formato ? now.format(formato) : now.utc().toDate();
};

export const convertirFechaLocal = (fechaUtc, formato = null) => {
  return formato
    ? dayjs.utc(fechaUtc).tz(ZONA_HORARIA).format(formato)
    : dayjs.utc(fechaUtc).tz(ZONA_HORARIA);
};

export const convertirALaUtc = (fechaLocal, formato = null) => {
  return formato
    ? dayjs(fechaLocal).tz(ZONA_HORARIA).utc().format(formato)
    : dayjs(fechaLocal).tz(ZONA_HORARIA).utc();
};
