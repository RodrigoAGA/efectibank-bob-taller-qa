# Lab 05 — Desarrollo backend

## Objetivo

Construye el motor financiero, el mock de tarifario y la API `POST /api/simulaciones`.
Al cerrar este lab, el backend responde una simulación válida y sus pruebas pasan.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| Backend Developer | Implementa motor, mock, API y pruebas. |
| Tech Lead | Revisa decisiones de arquitectura y cambios sensibles. |
| Riesgos / Producto | Valida cualquier cambio de tasas, seguros o fórmulas. |

## Antes de comenzar

Los siguientes archivos ya están preparados en el repositorio:

- `docs/arquitectura/formulas-negocio.md` — fórmulas financieras del PRD §5.7.
- `backend/seed/tarifario-seed.json` — datos iniciales de tasas y seguros.
- `backend/data/` — carpeta lista para el archivo SQLite en tiempo de ejecución.

## Paso 1 — Verificar el modo `credit-backend-developer`

El modo ya está configurado en `.bob/custom_modes.yaml`. Verifica que `credit-backend-developer` aparece en el selector de modos de Bob y selecciónalo antes de continuar.

## Paso 2 — Verificar el Skill financiero `reglas-negocio-credito`

El Skill ya está creado en `.bob/skills/reglas-negocio-credito/SKILL.md`. Verifica que aparece en la pestaña **Skills** de Bob, aprueba su activación si Bob lo solicita y mantenlo activo durante los pasos 3–6.

## Paso 3 — Crear el backend mínimo

En el chat de Bob, confirma que están activos el modo `credit-backend-developer`
y el Skill `reglas-negocio-credito`. Luego envía este prompt:

```text
Con el Skill reglas-negocio-credito activo, crea en /backend una aplicación
Node + Express + TypeScript. Incluye src/routes, src/services, src/models y un
endpoint GET /health que devuelva 200 y {"status":"ok"}. No implementes aún el
motor ni POST /api/simulaciones.
Ten en cuenta que /backend vive en la raíz del repositorio, no dentro del lab.
```

Bob propondrá comandos de instalación. Léelos antes de aprobarlos. Al terminar,
ejecuta `npm start` dentro de `backend/` y abre la URL del health check que Bob muestre.
Debes recibir `{"status":"ok"}`.

## Paso 4 — Implementar y probar el motor

En el mismo chat, sin cambiar de modo ni desactivar el Skill, envía:

```text
Con el Skill reglas-negocio-credito activo y usando @docs/arquitectura/formulas-negocio.md,
implementa /backend/src/services/calculoCredito.ts. Incluye monto financiado, TEM,
cuota francesa, seguro y cronograma. Gracia y cuotas dobles aplican solo a CONSUMO.
El período de gracia acepta únicamente 30 o 60 días (PRD §5.6); cualquier otro valor
debe rechazarse con 400. Los valores válidos vienen del campo periodoGraciaDias del tarifario.
Antes de editar, indica los archivos que modificarás. Después crea pruebas unitarias
con casos válidos, límites e intentos de usar gracia/cuotas dobles en otro producto.
Ten en cuenta que /backend vive en la raíz del repositorio.
```

Ejecuta la suite indicada por Bob. Si falla, pega el error en el chat y pide:
“Corrige esta prueba sin cambiar la fórmula de formulas-negocio.md”. No avances
hasta tener la suite en verde.

## Paso 5 — Mock de tarifario y API

En el chat de Bob, con el mismo modo y Skill activos, envía:

```text
Usa @docs/contracts/tarifario-api.yaml y @backend/seed/tarifario-seed.json. Implementa
un mock HTTP de tarifario y un cliente HTTP para consumirlo. Después implementa
POST /api/simulaciones: valida cada campo, consulta el tarifario, ejecuta el motor,
guarda la simulación en SQLite mediante un repositorio y devuelve resumen más
cronograma. Guarda el archivo de desarrollo en /backend/data/ y agrega su ruta a
.gitignore; en pruebas usa una base SQLite temporal y aislada. No importes el JSON
del tarifario dentro del motor de cálculo.
Ten en cuenta que /backend vive en la raíz del repositorio, no dentro del lab.
```

Prueba una solicitud válida y otra inválida. La inválida debe devolver `400` y un
detalle por campo. Revisa ambas respuestas antes de seguir.

## Comprobación antes de continuar

Ejecuta `npm test` y `npm run build` en `backend/` (en la raíz del repositorio). Deben pasar. Conserva el backend
arrancado: el Lab 06 conectará el frontend a `POST /api/simulaciones`.
