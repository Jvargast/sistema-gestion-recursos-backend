import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES || 8 * 1024 * 1024); // 8MB
const BASE_DIR = process.env.UPLOAD_DIR || path.resolve("uploads");

const sanitizeName = (s = "") => {
  const base = String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "") 
    .trim();
  return base.slice(0, 120) || "archivo";
};

const extFromMime = (mime = "") => {
  const map = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[mime] || "";
};

export async function saveAdjuntosB64(id_gasto, adjuntos = []) {
  const dir = path.join(BASE_DIR, "gastos", String(id_gasto));
  await fs.mkdir(dir, { recursive: true });

  const saved = [];
  for (const a of adjuntos.slice(0, 10)) {
    if (!a?.b64) continue;
    const buf = Buffer.from(String(a.b64), "base64");
    if (!buf.length) continue;
    if (buf.length > MAX_BYTES)
      throw new Error("Adjunto supera el tamaño máximo permitido.");

    const safeOriginal = sanitizeName(a.name);
    const extGuess =
      (safeOriginal.includes(".") ? `.${safeOriginal.split(".").pop()}` : "") ||
      extFromMime(a.type);
    const hash = crypto
      .createHash("sha1")
      .update(buf)
      .digest("hex")
      .slice(0, 10);
    const filename = `${Date.now()}_${hash}${extGuess || ""}`;
    const absPath = path.join(dir, filename);

    await fs.writeFile(absPath, buf);

    saved.push({
      id_gasto,
      original_name: safeOriginal,
      filename, // nombre físico
      path_rel: path.join("gastos", String(id_gasto), filename),
      mimetype: a.type || null,
      size: buf.length || null,
    });
  }
  return saved;
}
