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
    "id_insumo": null
  }
]
```

### GET /api/producto-retornable
Lista los productos retornables. Se pueden enviar parámetros de consulta como `estado` para filtrar los resultados.

**Solicitud**
```
GET /api/producto-retornable?estado=pendiente_inspeccion
```

**Respuesta exitosa**
```json
[
  {
    "id_producto_retornable": 1,
    "estado": "pendiente_inspeccion",
    "id_producto": 5,
    "id_insumo": null
  }
]
```

### POST /api/inventario-camion/vaciar/:id_camion
Descarga el inventario de un camión. Requiere el permiso `entregas.inventariocamion.vaciar`.

**Cuerpo de la solicitud**
```json
{
  "descargarDisponibles": true,
  "descargarRetorno": true
}
```
`descargarDisponibles` y `descargarRetorno` son opcionales y controlan si se descargan los productos disponibles y los productos de retorno.

**Solicitud**
```
POST /api/inventario-camion/vaciar/10
```

**Respuesta exitosa**
```json
{
  "message": "Camión vaciado correctamente"
}
```

### POST /api/producto-retornable/inspeccionar/:id_camion
Registra la inspección de los productos retornables de un camión. Requiere el permiso `inventario.productoretornable.editar`.

**Cuerpo de la solicitud**
```json
{
  "items": [
    {
      "id_producto": 5,
      "cantidad": 1,
      "estado": "reutilizable",
      "tipo_defecto": null
    }
  ]
}
```
Cada elemento del arreglo `items` indica el resultado de la inspección (`reutilizable` o `defectuoso`).

**Solicitud**
```
POST /api/producto-retornable/inspeccionar/10
```

**Respuesta exitosa**
```json
{
  "message": "Inspección completada"
}
```

### POST /api/agenda-viajes/:id_agenda_viaje/finalizar
Finaliza un viaje. Si el parámetro `descargarAuto` se envía como `true` en el cuerpo de la solicitud, el sistema descargará automáticamente el camión utilizando el endpoint anterior.

