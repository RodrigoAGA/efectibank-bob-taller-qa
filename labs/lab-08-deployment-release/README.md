# Lab 08 — Deployment / Release

## 1. Objetivo del lab

Construir un pipeline de CI en GitHub Actions y generar las release notes de la
primera versión del simulador.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| DevOps / Platform Engineer | Construye el pipeline de CI/CD. |
| Tech Lead | Revisa estrategia de branching y gate de aprobación. |

## 3. Artefactos de entrada

Los siguientes archivos ya están preparados en el repositorio:

- `docs/release/release-notes.md` — plantilla vacía lista para completar en el Paso 4.

Antes de crear el workflow, adopta esta estrategia: `main` está protegida y siempre
desplegable; crea una rama `feature/*` o `fix/*` por cambio; haz merge mediante PR
con revisión y CI en verde; libera desde `main`, sin ramas largas de release.

## 4. Paso a paso con Bob

### Modo recomendado — `release-engineer`

`release-engineer` exige revisión humana de cambios de infraestructura y prohíbe
escribir secretos o simular aprobaciones. Se usa durante todos los pasos del lab.

### Paso 0 — Verificar el modo `release-engineer` y el Skill `release-seguro-simulador`

El modo y el Skill ya están configurados en el repositorio:

- `.bob/custom_modes.yaml` — modo `release-engineer` disponible. Verifica que aparece en el selector y selecciónalo antes de revisar o generar CI.
- `.bob/skills/release-seguro-simulador/SKILL.md` — Skill disponible. Actívalo antes de los pasos 1–5 e inclúyelo en cada prompt.

### Antes de empezar — Confirmar el alcance seguro
Verifica que ningún secreto aparece en el workspace o diff. El archivo `AGENTS.md` ya contiene la sección de criterios de QA; agrégale al final el siguiente bloque sin eliminar las secciones anteriores:

```markdown
## Cambios de release
- No incluyas secretos, claves, tokens ni credenciales en código, YAML, logs o documentación.
- Todo cambio en `.github/workflows/` o dependencias requiere revisión humana antes del merge.
- El despliegue a staging requiere aprobación humana y un plan de rollback probado.
- No marques una liberación como completada si lint, pruebas o build fallan.
```

Guarda el archivo e inclúyelo en el PR de release.

### Paso 1 — Generar el workflow de CI (modo `release-engineer`)

El workflow es un archivo YAML en `.github/workflows/ci.yml` que GitHub lee automáticamente y ejecuta en sus servidores cada vez que hacés push o abrís un PR. Define tres jobs en secuencia:

```
lint-and-test (backend + frontend en paralelo)
      ↓ solo si pasan
build (backend + frontend en paralelo)
      ↓ solo si pasan + aprobación manual
deploy-staging (simulado)
```

Para generarlo:
```
Con el Skill release-seguro-simulador activo, genera .github/workflows/ci.yml para este repo (frontend con Vite, backend con
Node/Express + TypeScript). El workflow debe: instalar dependencias de ambos
paquetes, correr typecheck y tests, hacer build de frontend y backend, y terminar
con un job "deploy-staging" que solo se ejecuta si los pasos anteriores pasan,
requiere aprobación manual (GitHub Environment protection rule) y simula el deploy
imprimiendo los datos del commit (sin publicar a ningún hosting real).
```

Revisá el YAML generado antes de aceptarlo — es infraestructura, no solo código de aplicación. Si el pipeline falla después del push, copiá el log de GitHub Actions y pegalo en el chat para que Bob lo corrija. También podés reproducirlo localmente antes de hacer push (ver Paso 3).

### Paso 2 — Configurar el gate de aprobación manual
El workflow usa `environment: staging` en el job `deploy-staging`. GitHub busca ese environment y, si tiene **Required reviewers** activado, pausa el job hasta que alguien apruebe manualmente — sin eso el job falla o corre sin control.

Para crearlo: GitHub → **Settings** → **Environments** → **New environment** → nombre: `staging` → activá **Required reviewers** y agregá tu usuario.

Una vez configurado, cada vez que el build pase, el job `deploy-staging` quedará en estado **"Waiting"** en la pestaña Actions hasta que lo apruebes. Esto simula el control de cambios que tendría un deploy real en Banco ACME.

### Paso 3 — Ejecutar el pipeline
Antes de hacer push, corre localmente los mismos comandos que el workflow (`npm ci && npm run lint && npm test && npm run build` en cada paquete) — es más rápido depurar en tu máquina que iterando sobre GitHub Actions. Si algo falla:
```
@terminal ¿por qué falló este comando? Ayúdame a corregirlo antes de hacer push.
```
`@terminal` trae la salida completa del último comando al chat sin que tengas que copiarla; úsalo para depurar errores de build o de instalación de dependencias.

Con el pipeline pasando en local, haz push de una rama con un cambio pequeño (p. ej. un fix del Lab 07) y abre un PR. Verifica en la pestaña **Actions** de GitHub que el pipeline corre install → lint → test → build, y que `deploy-staging` queda esperando aprobación.

### Paso 4 — Release notes
```
Con el Skill release-seguro-simulador activo, genera las release notes de la v1.0.0 del Simulador de Crédito a partir del
historial de commits y PRs mergeados hasta ahora. Agrupa por tipo (feat, fix,
chore) siguiendo conventional commits. Guarda en docs/release/release-notes.md.
```

### Paso 5 — Runbook y plan de rollback
```
Con el Skill release-seguro-simulador activo, usando el workflow en @.github/workflows/ci.yml, genera dos documentos:
1. docs/release/deployment-runbook.md: pasos para ejecutar un deploy a staging,
   incluyendo cómo verificar que el pipeline pasó, cómo aprobar el gate
   y cómo confirmar que el deploy fue exitoso.
2. docs/release/rollback-plan.md: pasos para revertir un deploy fallido,
   incluyendo cómo revertir el merge a main y re-disparar el pipeline.
```

## 5. Al completar el lab

- `.github/workflows/ci.yml` creado.
- `docs/release/release-notes.md`, `deployment-runbook.md` y `rollback-plan.md` creados.
