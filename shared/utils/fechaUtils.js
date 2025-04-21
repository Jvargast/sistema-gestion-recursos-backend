// utils/fechaUtils.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONA_HORARIA = "America/Santiago";

export const obtenerFechaActualChile = (formato = null) => {
  return formato
    ? dayjs().tz(ZONA_HORARIA).format(formato)
    : dayjs().tz(ZONA_HORARIA).format();
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
