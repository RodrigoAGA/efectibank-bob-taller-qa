# Taller de QA con IBM Bob — Efectibank

Material del taller de **aseguramiento de calidad con IBM Bob** para el equipo de QA de Efectibank.
El taller trabaja sobre un caso de negocio completo: un **Simulador de Crédito** (backend, frontend,
requisitos y pruebas), para mostrar cómo Bob acompaña las tareas de QA desde el requisito hasta la
prueba automatizada.

## Agenda

| Sesión | Tema | Qué se ve |
|---|---|---|
| 1 | **Generación de casos de prueba** | De criterios de aceptación (Gherkin) a casos de prueba ejecutables: precondición, datos, pasos y resultado esperado. Clases de equivalencia y valores límite. Generación de la matriz de casos con Bob en modo de solo lectura (`qa-revisor`). |
| 2 | **Automatización de pruebas** | Pruebas de API, de componentes y E2E con Playwright generadas con Bob; revisión con `/review` y matriz de cobertura por requisito. |

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `prd/` | PRD del Simulador de Crédito: la fuente de verdad de negocio. |
| `docs/requisitos/` | Historias de usuario refinadas con criterios Gherkin, matriz de trazabilidad y glosario. |
| `docs/arquitectura/` | Fórmulas de negocio y decisiones de arquitectura. |
| `docs/qa/` | Plan de pruebas. |
| `docs/contracts/`, `openapi/` | Contratos de las APIs (Tarifario, Contacto con asesor). |
| `backend/` | API del simulador (Node + Express + TypeScript + SQLite) con mock del Tarifario y pruebas (Vitest + Supertest). |
| `frontend/` | Aplicación web (React + IBM Carbon) con pruebas de componentes (Vitest + Testing Library). |
| `frontend-figma/` | Versión del frontend generada desde el diseño en Figma (Lab 04). |
| `e2e/` | Pruebas de extremo a extremo (Playwright). |
| `labs/` | Guías paso a paso por fase del ciclo de desarrollo. Para QA: **Lab 02** (requerimientos) y **Lab 07** (testing). |
| `.bob/`, `AGENTS.md` | Modos personalizados, skills y reglas de proyecto de Bob. |

## Requisitos

- **Node.js 22 o superior** (el backend usa `node:sqlite`, incluido en Node 22).
- **IBM Bob IDE** con licencia activa.
- **Microsoft Edge** instalado (las pruebas E2E lo usan como navegador; ver `e2e/playwright.config.ts`).

## Cómo ejecutarlo

Abrir la carpeta raíz del repositorio en Bob, para que tome los modos y skills de `.bob/`.

```bash
# Backend: API en http://localhost:3001 y mock del Tarifario en http://localhost:4001
cd backend
npm install
npm test        # pruebas unitarias y de integración
npm start

# Frontend: http://localhost:5173
cd frontend
npm install
npm test        # pruebas de componentes
npm run dev

# E2E: levanta backend y frontend automáticamente
cd e2e
npm install
npm test
```

No hace falta ejecutar `npx playwright install`: las pruebas E2E usan el Edge ya instalado en la
máquina.

## Referencias

- [Documentación de IBM Bob IDE](https://bob.ibm.com/docs/ide)
- [AI in SDLC — IBM](https://www.ibm.com/think/topics/ai-in-sdlc)
