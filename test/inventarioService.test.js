import test from 'node:test';
import assert from 'node:assert/strict';
import InventarioService from '../inventario/application/InventarioService.js';
import InventarioRepository from '../inventario/infrastructure/repositories/InventarioRepository.js';

// Save original methods to restore after tests
const originalFindByInsumoId = InventarioRepository.findByInsumoId;
const originalUpdateInsumo = InventarioRepository.updateInsumo;

test('decrementarStockInsumo actualiza la cantidad y persiste', async () => {
  let updateCalledWith = null;
  InventarioRepository.findByInsumoId = async () => ({ id_insumo: 1, cantidad: 10 });
  InventarioRepository.updateInsumo = async (id, data) => {
    updateCalledWith = { id, data };
    return [1];
  };

  const result = await InventarioService.decrementarStockInsumo(1, 3);

  assert.equal(result.cantidad, 7);
  assert.deepEqual(updateCalledWith, { id: 1, data: { cantidad: 7 } });
});

test('decrementarStockInsumo lanza error con stock insuficiente', async () => {
  InventarioRepository.findByInsumoId = async () => ({ id_insumo: 1, cantidad: 2 });
  await assert.rejects(
    () => InventarioService.decrementarStockInsumo(1, 5),
    { message: 'Stock insuficiente en  InventarioService' }
  );
});

test('cleanup', () => {
  // restore original methods
  InventarioRepository.findByInsumoId = originalFindByInsumoId;
  InventarioRepository.updateInsumo = originalUpdateInsumo;
});
