import { execSync } from "child_process";
import dotenv from "dotenv";
import sequelize from "../database.js";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";

console.log(`📄 Cargando variables desde ${envFile}`);
dotenv.config({ path: envFile });

const TABLES_TO_KEEP = [
  "Caja",
  "Camion",
  "CategoriaGasto",
  "CategoriaProducto",
  "CentroCosto",
  "ClienteSucursal",
  "Clientes",
  "Empresas",
  "EstadoProducto",
  "EstadoVenta",
  "Estado_Pago",
  "FormulaProducto",
  "FormulaProductoDetalle",
  "Insumo",
  "MetodoPago",
  "Permisos",
  "PermisosDependencias",
  "Producto",
  "Proveedor",
  "Roles",
  "RolesPermisos",
  "SecuritySettings",
  "Sucursales",
  "TipoInsumo",
  "Usuarios",
];

function createBackup() {
  const {
    DB_HOST,
    DB_PORT = "5432",
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error(
      "Faltan variables de entorno DB_HOST/DB_USER/DB_PASSWORD/DB_NAME"
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = `backup_${DB_NAME}_${timestamp}.dump`;

  console.log(`🧩 Creando backup con pg_dump: ${backupFile}`);

  const cmd = [
    `PGPASSWORD="${DB_PASSWORD}"`,
    "pg_dump",
    `-h ${DB_HOST}`,
    `-p ${DB_PORT}`,
    `-U ${DB_USER}`,
    `-d ${DB_NAME}`,
    "-F c",
    `-f ${backupFile}`,
  ].join(" ");

  execSync(cmd, { stdio: "inherit" });

  console.log("✅ Backup creado correctamente.");
  console.log(`   Archivo: ${backupFile}`);
  return backupFile;
}

async function getAllTables() {
  const [rows] = await sequelize.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);
  return rows.map((r) => r.tablename);
}

function quoteIdent(name) {
  const safe = name.replace(/"/g, '""');
  return `"${safe}"`;
}

async function resetTransactionalTables() {
  console.log("🧩 Obteniendo tablas de la base de datos...");
  const allTables = await getAllTables();

  const keepSet = new Set(TABLES_TO_KEEP);
  const tablesToTruncate = allTables.filter((t) => !keepSet.has(t));

  console.log("📦 Tablas que se mantendrán (maestras):");
  console.log([...keepSet].sort().join(", "));

  console.log("\n🔥 Tablas que se van a TRUNCATE (transaccionales):");
  console.log(tablesToTruncate.sort().join(", "));

  if (tablesToTruncate.length === 0) {
    console.log("No hay tablas para truncar. Saliendo.");
    return;
  }

  const truncateList = tablesToTruncate.map(quoteIdent).join(", ");

  const sql = `
    TRUNCATE TABLE
      ${truncateList}
    RESTART IDENTITY CASCADE;
  `;

  console.log(
    "\n⚠️ ATENCIÓN: Se va a ejecutar este TRUNCATE dentro de una transacción:"
  );
  console.log(sql);

  if (process.env.CONFIRM_RESET !== "YES") {
    throw new Error(
      "Por seguridad, debes ejecutar con CONFIRM_RESET=YES en las variables de entorno."
    );
  }

  await sequelize.transaction(async (t) => {
    await sequelize.query(sql, { transaction: t });
  });

  console.log(
    "✅ Reset transaccional completado (TRUNCATE + RESTART IDENTITY)."
  );
}

async function main() {
  try {
    console.log("🔗 Conectando a la BD...");
    await sequelize.authenticate();
    console.log("✅ Conexión OK.");

    const backupFile = createBackup();

    await resetTransactionalTables();

    console.log("\n🎉 Proceso completado con éxito.");
    console.log("   Si alguna vez necesitas rollback:");
    console.log(
      `   pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --clean --if-exists ${backupFile}`
    );
  } catch (err) {
    console.error("\n❌ ERROR en el proceso:", err.message);
  } finally {
    await sequelize.close();
    console.log("🔌 Conexión cerrada.");
  }
}

main();
