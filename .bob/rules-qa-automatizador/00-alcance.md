# Alcance del modo qa-automatizador

Estas reglas se aplican siempre que Bob trabaje en el modo `qa-automatizador`.

1. **Solo se escribe en `e2e-selenium/`.** Nunca se crean, modifican ni borran
   archivos en `backend/`, `frontend/`, `docs/`, `prd/`, `openapi/` ni `.bob/`.
2. **El contrato se lee, no se supone.** Antes de escribir una prueba se revisan
   `backend/src/routes/`, `backend/src/validation/` y `frontend/src/components/`.
   Campos, códigos HTTP, mensajes, `id` y textos de botones salen de ahí.
3. **Pantalla o API.** Si la pantalla no tiene el control que el caso necesita,
   el caso se prueba por API (REST Assured) y se explica por qué.
4. **Trazabilidad.** Cada clase de pruebas indica la historia y el requisito
   (`HU-xx · RF-xx`) en su `@DisplayName`.
5. **Siempre se ejecuta.** Después de escribir, se corren las pruebas con Maven
   Wrapper y se reporta el resultado: cuántas pasaron, cuáles fallaron y por qué.
6. **No se corrige la aplicación.** Si una prueba falla por un defecto del
   sistema, se reporta con la evidencia; la corrección le toca a Desarrollo.
