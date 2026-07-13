# Viajes Cuba

Monorepo base para un producto de reservas y comercializacion turistica en Cuba.
La primera app es un portal Ionic Angular preparado para web, PWA, Android e iOS.

## Stack

- Nx como estructura de monorepo.
- Angular standalone con Ionic Angular.
- Capacitor preparado para empaquetar Android/iOS.
- Librerias internas para dominio turistico, configuracion por tenant y futuro adaptador Supabase.
- Datos demo en memoria hasta conectar la base de datos.

## Estructura

```txt
apps/
  portal/                    App comercial Ionic Angular
libs/
  travel/domain/             Tipos y datos base de alojamientos/servicios
  platform/tenant-config/    Branding, modulos y reglas por cliente
  platform/supabase-adapter/ Puertos para conectar Supabase despues
```

## Comandos

```sh
npm ci
npm run serve:portal
npm run build:production
```

Para mobile, despues de compilar:

```sh
npx cap add android
npx cap add ios
npx cap sync
```

## Customizacion por cliente

La marca inicial esta en `libs/platform/tenant-config/src/index.ts`.
Ahi se pueden cambiar:

- nombre comercial
- colores
- email de ventas
- modulos activos
- reglas de comision

## Preparacion para produccion

La version de Node requerida esta fijada en `.nvmrc`. Copia `.env.example` a
`.env` y configura las dos variables publicas de Supabase. El build genera
`runtime-config.js`; la anon key es publica por diseno, pero nunca se debe
incluir `SUPABASE_SERVICE_ROLE_KEY` en Angular, Vercel ni el repositorio.

La base de datos parte de la migracion versionada en
`supabase/migrations/202607130001_initial_schema.sql`. Aplicala con la CLI de
Supabase contra cada proyecto antes de habilitar el portal. Incluye RLS para
catalogo publicado, viajeros, operadores y administradores; los roles solo se
asignan desde un contexto administrativo de servidor.

Para Vercel, `vercel.json` construye `portal`, sirve el directorio browser y
reescribe rutas SPA a `index.html`. Configura `VIAJES_SUPABASE_URL` y
`VIAJES_SUPABASE_ANON_KEY` en Preview y Production antes de crear un despliegue.

GitHub Actions ejecuta una instalacion limpia, pruebas unitarias, build de produccion y auditoria
de dependencias de produccion en cada pull request y push a `master`.

## Preparacion para Supabase

`libs/platform/supabase-adapter/src/index.ts` inicializa el cliente usando la
configuracion runtime y falla de forma explicita si no existe. La siguiente fase natural es agregar:

- tablas `tenants`, `travel_listings`, `reservations`, `service_packages`
- autenticacion por gestores/agencias
- storage para imagenes de propiedades
- reglas RLS por `tenant_id`

## Ingesta de datos externos

El proyecto esta preparado para poblar hoteles desde fuentes externas como
Havanatur, Cubatur u otros catalogos, pero siempre como borradores revisables.
No se deben copiar fotos o descripciones de terceros como contenido propio.

El flujo recomendado esta en `tools/importers/hotels/README.md`:

- importar datos factuales con `sourceName`, `sourceUrl` y `licenseStatus`
- conservar texto crudo solo para revision interna
- reescribir descripciones con contenido propio
- usar fotos propias, autorizadas, abiertas o placeholders
- aprobar manualmente antes de publicar o sincronizar con Supabase
