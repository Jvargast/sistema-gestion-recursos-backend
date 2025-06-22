import test from 'node:test';
import assert from 'node:assert/strict';

import InventarioCamionRepository from '../Entregas/infrastructure/repositories/InventarioCamionRepository.js';
import InventarioCamion from '../Entregas/domain/models/InventarioCamion.js';
import InventarioCamionService from '../Entregas/application/InventarioCamionService.js';

const originalFindAll = InventarioCamion.findAll;
const originalRepoMethod = InventarioCamionRepository.findAllByCamionId;

test('findAllByCamionId forwards transaction to model', async () => {
  let received = null;
  InventarioCamion.findAll = async (opts) => {
    received = opts;
    return [];
  };
  const tx = {};
  await InventarioCamionRepository.findAllByCamionId(1, { transaction: tx });
  assert.equal(received.transaction, tx);
});

test('descargarItemsCamion forwards transaction to repository', async () => {
  let repoOpts = null;
  InventarioCamionRepository.findAllByCamionId = async (id, opts) => {
    repoOpts = opts;
    return [];
  };
  const tx = {};
  await InventarioCamionService.descargarItemsCamion(
    1,
    { descargarRetorno: true, descargarDisponibles: true },
    tx
  );
  assert.equal(repoOpts.transaction, tx);
});

test('cleanup', () => {
  InventarioCamion.findAll = originalFindAll;
  InventarioCamionRepository.findAllByCamionId = originalRepoMethod;
});
