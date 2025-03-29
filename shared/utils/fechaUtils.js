import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Dado un string "YYYY-MM-DD" en hora Chile, retorna el rango UTC para hacer un filtro Sequelize.
 * Ej: "2025-03-29" => { inicioUTC: Date, finUTC: Date }
 */
export const obtenerRangoUTCDesdeFechaLocal = (fechaLocal) => {
  const inicioUTC = dayjs
    .tz(`${fechaLocal} 00:00:00`, "America/Santiago")
    .utc()
    .toDate();
  const finUTC = dayjs
    .tz(`${fechaLocal} 23:59:59`, "America/Santiago")
    .utc()
    .toDate();
  return { inicioUTC, finUTC };
};
