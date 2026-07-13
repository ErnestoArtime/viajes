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

## Orden recomendado

1. OpenStreetMap + Wikidata para nombres, coordenadas y datos factuales.
2. CubaTravel para estructura de destinos/provincias.
3. Gaviota, Melia, Iberostar, Solways, Travelnet Cuba y Gran Caribe para cruzar inventario.
4. Wikimedia Commons, fotos propias o placeholders para imagenes.
5. Tripadvisor, Booking, Google y sitios similares solo como referencia manual.

El catalogo de fuentes inicial esta en `sources.catalog.json`.

## Estados obligatorios

- `status`: `draft`, `needs_review`, `approved`, `rejected`
- `operationalStatus`: `active`, `temporarily_closed`, `unknown`, `legacy`
- `licenseStatus`: `unknown`, `allowed`, `needs_permission`, `open_license`, `demo_only`

Cada registro importado debe conservar `lastCheckedAt`. Esto importa porque la gestion
hotelera en Cuba cambia y una ficha puede quedar como historica o temporalmente cerrada.
