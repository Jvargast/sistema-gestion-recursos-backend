import test from 'node:test';
import assert from 'node:assert/strict';

import AgendaViajeService from '../Entregas/application/AgendaViajeService.js';
import AgendaViajesRepository from '../Entregas/infrastructure/repositories/AgendaViajesRepository.js';
import CamionRepository from '../Entregas/infrastructure/repositories/CamionRepository.js';
import CajaRepository from '../ventas/infrastructure/repositories/CajaRepository.js';
import HistorialCajaRepository from '../ventas/infrastructure/repositories/HistorialCajaRepository.js';
import InventarioCamionRepository from '../Entregas/infrastructure/repositories/InventarioCamionRepository.js';
import InventarioCamionService from '../Entregas/application/InventarioCamionService.js';
import sequelize from '../database/database.js';

const original = {
  transaction: sequelize.transaction,
  findAgenda: AgendaViajesRepository.findByAgendaViajeId,
  findCamion: CamionRepository.findById,
  findCaja: CajaRepository.findByAsignado,
  updateCaja: CajaRepository.update,
  histCajaCreate: HistorialCajaRepository.create,
  findInventario: InventarioCamionRepository.findAllByCamionId,
  vaciarCamion: InventarioCamionService.vaciarCamion
};

function setupStubs() {
  const transaction = {
    finished: null,
    async commit() { this.finished = 'commit'; },
    async rollback() { this.finished = 'rollback'; }
  };
  sequelize.transaction = async () => transaction;

  AgendaViajesRepository.findByAgendaViajeId = async () => ({
    id_agenda_viaje: 1,
    id_camion: 10,
    estado: 'En Tránsito',
    id_chofer: 'CHOFER1',
    async save() {}
  });

  CamionRepository.findById = async () => ({
    id_camion: 10,
    estado: 'En uso',
    async save() {}
  });

  CajaRepository.findByAsignado = async () => ({
    id_caja: 5,
    id_sucursal: 1,
    saldo_final: 0
  });

  CajaRepository.update = async () => {};
  HistorialCajaRepository.create = async () => {};
  InventarioCamionRepository.findAllByCamionId = async () => [];

  let called = { value: false };
  InventarioCamionService.vaciarCamion = async () => { called.value = true; };

  return { called };
}

test('finalizarViaje descarga el camión si descargarAuto es true', async () => {
  const { called } = setupStubs();

  await AgendaViajeService.finalizarViaje(1, 'CHOFER1', { descargarAuto: true });

  assert.equal(called.value, true);
});

test('finalizarViaje no descarga el camión si descargarAuto es false', async () => {
  const { called } = setupStubs();

  await AgendaViajeService.finalizarViaje(1, 'CHOFER1', { descargarAuto: false });

  assert.equal(called.value, false);
});

test('cleanup', () => {
  sequelize.transaction = original.transaction;
  AgendaViajesRepository.findByAgendaViajeId = original.findAgenda;
  CamionRepository.findById = original.findCamion;
  CajaRepository.findByAsignado = original.findCaja;
  CajaRepository.update = original.updateCaja;
  HistorialCajaRepository.create = original.histCajaCreate;
  InventarioCamionRepository.findAllByCamionId = original.findInventario;
  InventarioCamionService.vaciarCamion = original.vaciarCamion;
});
