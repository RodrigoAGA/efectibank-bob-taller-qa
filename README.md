# Taller de QA con IBM Bob — Efectibank

Material del taller de **aseguramiento de calidad con IBM Bob** para el equipo de QA de Efectibank.
El taller trabaja sobre un caso de negocio completo: un **Simulador de Crédito** (backend, frontend,
requisitos y pruebas), para mostrar cómo Bob acompaña las tareas de QA desde el requisito hasta la
prueba automatizada.

## Agenda

| Sesión | Tema | Qué se ve |
|---|---|---|
| 1 | **Generación de casos de prueba** | De criterios de aceptación (Gherkin) a casos de prueba ejecutables: precondición, datos, pasos y resultado esperado. Clases de equivalencia y valores límite. Generación de la matriz de casos con Bob en modo de solo lectura (`qa-revisor`). |
| 2 | **Automatización de pruebas** | Automatización con Bob de los casos de la matriz en **Selenium WebDriver + Java** (interfaz) y **REST Assured + Java** (API); revisión de cambios con `/review` y matriz de cobertura por requisito. |

El simulador está construido en TypeScript (Node.js y React), tal como lo define el bootcamp de IBM.
Eso no condiciona la automatización: Selenium y REST Assured prueban la aplicación desde afuera
(navegador y HTTP), independientemente del lenguaje en que esté hecha. Las pruebas en Java de la
sesión 2 están en `e2e-selenium/`.

### Recorrido de la sesión 2

1. **Validar la matriz antes de automatizar.** Bob, en modo `qa-revisor`, compara la matriz de la
   sesión 1 (`docs/qa/matriz-casos-hu-05-sesion-1.html`) con el código real: contrato de la API y
   pantalla. Los casos que suponen controles, campos o códigos que no existen se corrigen antes de
   automatizarlos.
2. **Automatizar.** Bob, en modo `qa-automatizador` (solo puede escribir en `e2e-selenium/`),
   genera las pruebas de API con REST Assured y las de pantalla con Selenium, y las ejecuta.
3. **Probar un cambio de Desarrollo.** La rama `demo/cambio-desarrollo` trae un cambio en la
   validación del backend. Ejercicio: pedirle a Bob que lea el último commit, identifique la regla
   nueva, genere las pruebas con valores límite y las ejecute.

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
| `e2e/` | Pruebas de extremo a extremo de referencia del bootcamp (Playwright). |
| `e2e-selenium/` | Pruebas automatizadas de la sesión 2: pantalla con **Selenium WebDriver** y API con **REST Assured** (Java 17, JUnit 5, Maven Wrapper). Ver su `README.md`. |
| `docs/qa/` | Plan de pruebas, matriz de casos de la sesión 1 y prompts de la sesión 2 (`prompts-sesion-2.md`). |
| `labs/` | Guías paso a paso por fase del ciclo de desarrollo. Para QA: **Lab 02** (requerimientos) y **Lab 07** (testing). |
| `.bob/`, `AGENTS.md` | Modos personalizados, skills y reglas de proyecto de Bob. Para QA: `qa-revisor` (solo lectura) y `qa-automatizador` (escribe y ejecuta pruebas solo en `e2e-selenium/`). |

## Requisitos

- **Node.js 22 o superior** (el backend usa `node:sqlite`, incluido en Node 22).
- **IBM Bob IDE** con licencia activa.
- **Microsoft Edge** (Windows) o **Google Chrome** para las pruebas de pantalla.
- **Java 17 o superior** para `e2e-selenium/` (Maven no hace falta: viene Maven Wrapper).

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

# Pruebas de la sesión 2 (Selenium + REST Assured), con backend y frontend ya levantados
cd e2e-selenium
./mvnw test     # en Windows: .\mvnw.cmd test

# E2E de referencia del bootcamp (Playwright): levanta backend y frontend automáticamente
cd e2e
npm install
npm test
```

Las pruebas E2E de Playwright usan el Edge ya instalado en la máquina: no hace falta ejecutar
`npx playwright install`.

## Referencias

- [Documentación de IBM Bob IDE](https://bob.ibm.com/docs/ide)
- [AI in SDLC — IBM](https://www.ibm.com/think/topics/ai-in-sdlc)
