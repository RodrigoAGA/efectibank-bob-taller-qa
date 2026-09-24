# Lab 07 — Testing / QA

## 1. Objetivo del lab

Verificar que el backend del Lab 05 y el frontend del Lab 06 cumplen los criterios de aceptación definidos en el Lab 02, usando Bob para generar pruebas, revisar calidad de código (`/review`, Bob Findings, Consejos de Bob) y documentar cobertura frente a los 18 requerimientos funcionales del PRD. Las pruebas se separan por responsabilidad: **frontend React**, **backend/API** y un flujo **E2E** que comprueba la integración completa. Esta es la fase de **Pruebas** del SDLC: se valida antes de liberar, no después.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| QA Engineer | Diseña el plan de pruebas, ejecuta revisión y hace triage de hallazgos. |
| Developers | Corrigen hallazgos y pruebas fallidas. |

## 3. Artefactos de entrada

Los siguientes archivos ya están preparados en el repositorio:

- `docs/qa/plan-pruebas.md` — plantilla vacía lista para completar en el Paso 3.
- `docs/requisitos/historias-usuario-refinadas.md` — historias refinadas del Lab 02.
- `docs/requisitos/matriz-trazabilidad.csv` — RF-01 a RF-18 en estado Pendiente.

## 4. Paso a paso con Bob

### Modo recomendado — `qa-revisor`

Usa `qa-revisor` para diagnóstico, priorización y revisión. Cambia a Agent para
crear, ejecutar o corregir pruebas, y vuelve a `qa-revisor` para revisar evidencia.

### Paso 1 — Verificar el modo `qa-revisor` y el archivo AGENTS.md

El modo ya está configurado en `.bob/custom_modes.yaml` (solo `read` y `skill` — sin `edit` ni `execute`). Verifica que `qa-revisor` aparece en el selector de modos y selecciónalo antes del Paso 3 y para el Paso 10.

El archivo `AGENTS.md` ya contiene los criterios de QA en la raíz del proyecto. Verifica que existe antes de continuar.

### Paso 2 — Verificar el Skill `validacion-simulador`

El Skill ya está creado en `.bob/skills/validacion-simulador/SKILL.md`. Verifica que aparece en la pestaña **Skills** de Bob y aprueba su activación. Úsalo antes de pedir pruebas a Bob.

| Área | Herramientas sugeridas | Evidencia esperada |
|---|---|---|
| Frontend | Vitest + React Testing Library | Renderizado, campos condicionales, validaciones y acciones del usuario. |
| Backend | Vitest/Jest + Supertest | Fórmulas, contratos HTTP, validación y persistencia de simulaciones en SQLite temporal. |
| E2E | Playwright | El recorrido real navegador → API → resultado visible. |

### Paso 3 — Plan de pruebas

#### Paso 3a — Análisis y priorización (modo `qa-revisor`)
Discute con Bob qué RF son más riesgosos y dónde conviene invertir en automatización. El modo solo lee y razona — no edita archivos.
```
Usando @docs/requisitos/historias-usuario-refinadas.md, para cada RF sugiéreme
qué tipo de prueba conviene (unitaria, integración, E2E, manual) y qué tan
prioritario es, considerando que este es un simulador de crédito bancario donde
los cálculos son lo más sensible.
```

#### Paso 3b — Guardar el plan (modo Agent)
Cambia a modo **Agent** y guarda el resultado de la discusión anterior:
```
Guarda el plan de pruebas acordado en docs/qa/plan-pruebas.md, conservando su tabla.
```

### Paso 4 — Pruebas de backend: motor, API y persistencia (modo Agent)
```
Genera pruebas unitarias para
/backend/src/services/calculoCredito.ts que
verifiquen: monto financiado, TEM desde TEA, cuota base y las primeras 3
cuotas del cronograma usando inputs concretos con valores expected derivados
de las fórmulas en @docs/arquitectura/formulas-negocio.md. Incluye un caso
que verifique que cuotas dobles y período de gracia NO aplican a
Automotriz/Comercial/Hipotecario.
Ten en cuenta que /backend vive en la raíz del repositorio.
```

Después agrega una prueba de integración para `POST /api/simulaciones`. Debe verificar que una solicitud válida devuelve el resumen y cronograma, que una solicitud inválida devuelve `400` con detalles por campo, y que una simulación válida se registra. Mockea solo dependencias externas inestables; el motor de cálculo debe ser el real.
Usa una base SQLite temporal por prueba o suite, comprueba el registro a través del
repositorio y elimínala al finalizar; no uses ni modifiques la base local de desarrollo.

### Paso 5 — Pruebas de componentes React (modo Agent)
Con el Skill `validacion-simulador` activo, solicita:

```
Usando @frontend/src/components/SimuladorForm.tsx y
@docs/requisitos/historias-usuario-refinadas.md y el skill validacion-simulador,
crea /frontend/src/components/SimuladorForm.test.tsx. Prueba desde la perspectiva
del usuario: selección exclusiva de producto, campos que aparecen solo para
CONSUMO, opciones de plazo válidas, mensajes de validación y envío de una
simulación válida. No pruebes detalles internos ni clases CSS.
Ten en cuenta que /frontend vive en la raíz del repositorio.
```

Estas pruebas no levantan un navegador completo: renderizan el componente y simulan la interacción. Son rápidas y detectan regresiones de UI antes de E2E.

### Paso 6 — Verificación funcional libre (modo Agent)
Antes de automatizar, verificá que el flujo principal funciona corriendo el frontend y backend:

```bash
# terminal 1
cd backend && npm start

# terminal 2
cd frontend && npm run dev
```

Abrí el simulador en el navegador y recorré el flujo: seleccioná **Consumo**, completá los datos, calculá y verificá que aparece el resultado con cuota y cronograma. Si algo no funciona o querés ajustar un detalle visual (color, texto, espaciado):

```
El flujo de simulación falla en [describe el problema]. Corregilo.
```

Este espacio es libre — el objetivo es que el flujo principal funcione antes de automatizarlo.

### Paso 7 — Prueba E2E con Playwright (modo Agent)
Instala Playwright en el repositorio (`npm init playwright@latest`) y luego:

```
Con el skill validacion-simulador, crea una prueba Playwright para el frontend
real leyendo @frontend/src/components/SimuladorForm.tsx para identificar los
labels y roles correctos. Usa selectores accesibles (label, role o test id estable), no
selectores basados en estructura o clases CSS. El test debe cubrir estos dos recorridos:
1. Seleccionar "Consumo", completar datos válidos, calcular y confirmar que
   aparece la cuota, el cronograma y los disclaimers. La prueba debe esperar
   la respuesta real de /api/simulaciones y comprobar el resultado visible.
2. Ingresar un monto inválido, intentar simular y confirmar que no se hace
   ningún POST a /api/simulaciones.
```

### Paso 8 — Limpiar errores (modo Agent)
Antes de pasar a `/review`, corré el linter/build. Si hay errores usá cualquiera de estas menciones según el origen del problema:

```
@problems corrige todos estos problemas y explícame brevemente qué causó cada uno.
```
```
@terminal ¿por qué falló este comando? Corregilo.
```

- `@problems` → errores de lint/tipos del panel de Bob.
- `@terminal` → errores de compilación o ejecución en consola.

### Paso 9 — Code review con `/review`
1. Abre el panel de revisión con `/review`.
2. Selecciona la rama que contiene los cambios de los Labs 05 y 06 contra `main`.
3. Activa "Incluir cambios no confirmados" si aplica.
4. Haz clic en **Iniciar revisión**.
5. En el panel **Bob Findings** aparecen tanto los hallazgos del `/review` como los **Bob Tips** (subrayados morados de alta complejidad o baja mantenibilidad). Para cada hallazgo: usa **Corregir con Bob** si es válido, o **Descartar** si no aplica.
6. Si hay hallazgos relevantes, pedile a Bob que los documente:
```
Documenta los hallazgos del panel de revisión en docs/qa/bob-findings-report.md
con severidad, RF afectado y evidencia.
```

### Paso 10 — Matriz de cobertura (modo Plan o Agent)
```
Compara docs/qa/plan-pruebas.md y las pruebas creadas contra
@docs/requisitos/matriz-trazabilidad.csv. Actualiza el
estado de cada RF a "Cubierto", "Parcial" o "Pendiente" y guarda como
docs/qa/matriz-cobertura-rf.md.
```

## 5. Al completar el lab

- `docs/qa/plan-pruebas.md`, `docs/qa/bob-findings-report.md` y
  `docs/qa/matriz-cobertura-rf.md` creados.
- Pruebas de frontend, backend y E2E en verde.
