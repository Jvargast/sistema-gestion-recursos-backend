import test from 'node:test';
import assert from 'node:assert/strict';
import ProductoRetornableService from '../inventario/application/ProductoRetornableService.js';
import ProductoRetornableRepository from '../inventario/infrastructure/repositories/ProductoRetornableRepository.js';
import InventarioService from '../inventario/application/InventarioService.js';
import InventarioCamionRepository from '../Entregas/infrastructure/repositories/InventarioCamionRepository.js';

const originalFindAll = ProductoRetornableRepository.findAll;

const originalUpdate = ProductoRetornableRepository.updateByCamionAndProducto;
const originalIncrement = InventarioService.incrementStock;
const originalDelete = InventarioCamionRepository.deleteProductInCamion;

test('inspeccionarRetornables procesa items correctamente', async () => {
  const updateCalls = [];
  const incrementCalls = [];
  const deleteCalls = [];

  ProductoRetornableRepository.updateByCamionAndProducto = async (id_camion, id_producto, data, options) => {
    updateCalls.push({ id_camion, id_producto, data });
    return [1];
  };
  InventarioService.incrementStock = async (id_producto, cantidad) => {
    incrementCalls.push({ id_producto, cantidad });
  };
  InventarioCamionRepository.deleteProductInCamion = async (id_camion, id_producto, estado) => {
    deleteCalls.push({ id_camion, id_producto, estado });
  };

  const items = [
    { id_producto: 1, cantidad: 2, estado: 'reutilizable' },
    { id_producto: 2, cantidad: 1, estado: 'defectuoso', tipo_defecto: 'roto' }
  ];

  await ProductoRetornableService.inspeccionarRetornables(5, items);

  assert.equal(updateCalls.length, 2);
  assert.equal(incrementCalls.length, 1);
  assert.equal(deleteCalls.length, 2);
});

test('inspeccionarRetornables propaga errores', async () => {
  ProductoRetornableRepository.updateByCamionAndProducto = async () => {
    throw new Error('fail');
  };

  await assert.rejects(
    () => ProductoRetornableService.inspeccionarRetornables(5, [{ id_producto: 1, cantidad: 1, estado: 'reutilizable' }]),
    { message: 'fail' }
  );
});

test('getAllProductosRetornables filtra por estado pendiente_inspeccion', async () => {
  const sample = [
    { id_producto_retornable: 1, estado: 'pendiente_inspeccion' },
    { id_producto_retornable: 2, estado: 'reutilizable' }
  ];

  let receivedFilters = null;
  ProductoRetornableRepository.findAll = async (filters) => {
    receivedFilters = filters;
    return sample.filter(p => !filters.estado || p.estado === filters.estado);
  };

  const result = await ProductoRetornableService.getAllProductosRetornables({ estado: 'pendiente_inspeccion' });

  assert.deepEqual(receivedFilters, { estado: 'pendiente_inspeccion' });
  assert.equal(result.length, 1);
  assert.equal(result[0].estado, 'pendiente_inspeccion');
});

test('cleanup', () => {
  ProductoRetornableRepository.updateByCamionAndProducto = originalUpdate;
  InventarioService.incrementStock = originalIncrement;
  InventarioCamionRepository.deleteProductInCamion = originalDelete;
  ProductoRetornableRepository.findAll = originalFindAll;
});
