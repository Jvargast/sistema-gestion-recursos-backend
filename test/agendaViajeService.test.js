import test from 'node:test';
import assert from 'node:assert/strict';
import AgendaViajeService from '../Entregas/application/AgendaViajeService.js';
import AgendaViajesRepository from '../Entregas/infrastructure/repositories/AgendaViajesRepository.js';
import CamionRepository from '../Entregas/infrastructure/repositories/CamionRepository.js';
import InventarioCamionRepository from '../Entregas/infrastructure/repositories/InventarioCamionRepository.js';
import CajaRepository from '../ventas/infrastructure/repositories/CajaRepository.js';
import HistorialCajaRepository from '../ventas/infrastructure/repositories/HistorialCajaRepository.js';
import InventarioCamionService from '../Entregas/application/InventarioCamionService.js';
import sequelize from '../database/database.js';

const originalTransaction = sequelize.transaction;
const originalFindAgenda = AgendaViajesRepository.findByAgendaViajeId;
const originalFindCamion = CamionRepository.findById;
const originalFindCaja = CajaRepository.findByAsignado;
const originalVaciar = InventarioCamionService.descargarItemsCamion;
const originalInventarioFind = InventarioCamionRepository.findAllByCamionId;
const originalHistorialCreate = HistorialCajaRepository.create;
const originalCajaUpdate = CajaRepository.update;

test('finalizarViaje descarga inventario y actualiza inventario_final', async () => {
  const fakeTransaction = { finished: undefined, commit: async () => { fakeTransaction.finished = 'commit'; }, rollback: async () => { fakeTransaction.finished = 'rollback'; } };
  sequelize.transaction = async () => fakeTransaction;

  const agenda = { id_agenda_viaje: 1, id_camion: 10, id_chofer: '1', estado: 'En Tránsito', save: async () => {} };
  const camion = { id_camion: 10, estado: 'En Ruta', save: async () => {} };
  const caja = { id_caja: 1, id_sucursal: 1, saldo_final: 0 };
  const inventory = [];
  let calledWith = null;

  AgendaViajesRepository.findByAgendaViajeId = async () => agenda;
  CamionRepository.findById = async () => camion;
  CajaRepository.findByAsignado = async () => caja;
  InventarioCamionService.descargarItemsCamion = async (id, opts, t) => { calledWith = { id, opts, t }; };
  InventarioCamionRepository.findAllByCamionId = async () => inventory;
  HistorialCajaRepository.create = async () => {};
  CajaRepository.update = async () => {};

  const result = await AgendaViajeService.finalizarViaje(1, '1', true);

  assert.equal(calledWith.id, 10);
  assert.deepEqual(calledWith.opts, { descargarDisponibles: true, descargarRetorno: true });
  assert.strictEqual(calledWith.t, fakeTransaction);
  assert.deepEqual(agenda.inventario_final, inventory);
  assert.equal(result.message, 'Viaje finalizado con éxito.');
});

test('finalizarViaje respeta opcion descargarDisponibles false', async () => {
  const fakeTransaction = { finished: undefined, commit: async () => { fakeTransaction.finished = 'commit'; }, rollback: async () => { fakeTransaction.finished = 'rollback'; } };
  sequelize.transaction = async () => fakeTransaction;

  const agenda = { id_agenda_viaje: 2, id_camion: 20, id_chofer: '2', estado: 'En Tránsito', save: async () => {} };
  const camion = { id_camion: 20, estado: 'En Ruta', save: async () => {} };
  const caja = { id_caja: 2, id_sucursal: 1, saldo_final: 0 };
  let calledWith = null;

  AgendaViajesRepository.findByAgendaViajeId = async () => agenda;
  CamionRepository.findById = async () => camion;
  CajaRepository.findByAsignado = async () => caja;
  InventarioCamionService.descargarItemsCamion = async (id, opts, t) => { calledWith = { id, opts, t }; };
  InventarioCamionRepository.findAllByCamionId = async () => [];
  HistorialCajaRepository.create = async () => {};
  CajaRepository.update = async () => {};

  await AgendaViajeService.finalizarViaje(2, '2', false);

  assert.equal(calledWith.id, 20);
  assert.deepEqual(calledWith.opts, { descargarDisponibles: false, descargarRetorno: true });
  assert.strictEqual(calledWith.t, fakeTransaction);
});

test('cleanup', () => {
  sequelize.transaction = originalTransaction;
  AgendaViajesRepository.findByAgendaViajeId = originalFindAgenda;
  CamionRepository.findById = originalFindCamion;
  CajaRepository.findByAsignado = originalFindCaja;
  InventarioCamionService.descargarItemsCamion = originalVaciar;
  InventarioCamionRepository.findAllByCamionId = originalInventarioFind;
  HistorialCajaRepository.create = originalHistorialCreate;
  CajaRepository.update = originalCajaUpdate;
});
