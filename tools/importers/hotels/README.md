# Hotel Importers

Los importadores de hoteles deben producir borradores revisables, no contenido publicado.

## Reglas

- No copiar fotos ni descripciones de Havanatur, Cubatur u otros sitios como contenido propio.
- Guardar `sourceName`, `sourceUrl`, `licenseStatus` y `lastCheckedAt`.
- Mantener `rawDescription` solo para revision interna.
- Publicar un hotel solo cuando tenga `importStatus: "approved"`.
- Reescribir descripciones con texto propio.
- Usar fotos propias, autorizadas, de licencia abierta o placeholders para demo.
- No saltar login, captchas, bloqueos, APIs privadas, robots ni terminos del sitio.

## Flujo

```txt
Fuente externa
  -> ImportedHotelDraft
  -> normalizacion
  -> deduplicacion
  -> revision humana
  -> TravelListing aprobado
  -> Supabase / portal
```

Fuentes recomendadas para datos iniciales: carga manual, acuerdos con proveedores,
OpenStreetMap para ubicacion factual con atribucion, Wikimedia Commons revisando
licencia de cada archivo, y fotos propias o placeholders para pruebas.
