import test from 'node:test';
import assert from 'node:assert/strict';

import ProductoRetornableRepository from '../inventario/infrastructure/repositories/ProductoRetornableRepository.js';
import ProductoRetornable from '../inventario/domain/models/ProductoRetornable.js';

const originalFindByPk = ProductoRetornable.findByPk;
const originalFindAll = ProductoRetornable.findAll;

test('findById includes camion association', async () => {
  let opts = null;
  ProductoRetornable.findByPk = async (id, options) => {
    opts = options;
    return null;
  };
  await ProductoRetornableRepository.findById(1);
  const hasCamion = opts.include.some(i => i.as === 'camion');
  assert.equal(hasCamion, true);
});

test('findAll includes camion association', async () => {
  let opts = null;
  ProductoRetornable.findAll = async (options) => {
    opts = options;
    return [];
  };
  await ProductoRetornableRepository.findAll();
  const hasCamion = opts.include.some(i => i.as === 'camion');
  assert.equal(hasCamion, true);
});

test('cleanup', () => {
  ProductoRetornable.findByPk = originalFindByPk;
  ProductoRetornable.findAll = originalFindAll;
});
