# Sistema de Gestión de Recursos - Backend

## Endpoints

### GET /api/producto-retornable/pendientes
Obtiene la lista de productos retornables en estado `pendiente_inspeccion`.

Cada registro puede estar asociado a un producto (`id_producto`) o a un insumo
(`id_insumo`) dependiendo de lo que se haya retornado.

Sin parámetros.

**Solicitud**
```
GET /api/producto-retornable/pendientes
```

**Respuesta exitosa**
```json
[
  {
    "id_producto_retornable": 1,
    "estado": "pendiente_inspeccion",
    "id_producto": 5,
    "id_insumo": null,
    "id_cliente": 2
  }
]
```
