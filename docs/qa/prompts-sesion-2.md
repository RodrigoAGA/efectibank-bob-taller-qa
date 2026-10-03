# Prompts de la sesión 2 — Automatización de pruebas con Bob

Antes de cada prompt, elegir el modo indicado en el selector de modos de Bob.
Los prompts se ejecutan con la raíz del repositorio abierta en Bob y el simulador
levantado (ver el `README.md` de la raíz).

## 1. Validar la matriz contra el sistema real · modo `qa-revisor`

```
Revisa la matriz @docs/qa/matriz-casos-hu-05-sesion-1.html contra el código real: @backend/src/routes/simulaciones.ts, @backend/src/validation/simulacionValidator.ts y @frontend/src/components/. Para cada caso indica si se puede ejecutar tal como está escrito. Si no, explica por qué (control inexistente en pantalla, campo o código HTTP distinto al real) y cómo debería quedar. No modifiques archivos.
```

## 2. Prueba de API con REST Assured · modo `qa-automatizador`

```
Automatiza con REST Assured los casos de la HU-05 (RF-06) que validamos, en una clase nueva dentro de e2e-selenium/src/test/java/acme/simulador/qa/api/. Toma el contrato de @backend/src/validation/simulacionValidator.ts y @backend/src/routes/simulaciones.ts. Sigue el estilo de @e2e-selenium/src/test/java/acme/simulador/qa/api/PeriodoGraciaApiTest.java. Luego ejecuta, desde e2e-selenium, las pruebas de la clase nueva con Maven Wrapper y resume el resultado.
```

## 3. Prueba de pantalla con Selenium · modo `qa-automatizador`

```
Automatiza con Selenium la HU-07 (RF-07) para Crédito Hipotecario, en una clase nueva dentro de e2e-selenium/src/test/java/acme/simulador/qa/ui/: una TEA dentro del rango vigente muestra la cuota y una fuera del rango muestra el error con el rango válido. Usa los id y textos reales de @frontend/src/components/ y las clases de apoyo de e2e-selenium/src/test/java/acme/simulador/qa/soporte/. Ejecútala desde e2e-selenium con Maven Wrapper y resume el resultado.
```

## 4. Probar un cambio de Desarrollo · modo `qa-automatizador`

Primero cambiar a la rama del ejercicio: `git checkout demo/cambio-desarrollo`.

```
Desarrollo entregó un cambio en esta rama. Revisa el último commit, identifica qué regla cambió y a qué historia de @docs/requisitos/historias-usuario-refinadas.md corresponde. Genera las pruebas de API que la cubren, con valores límite, ejecútalas junto con las existentes con Maven Wrapper desde e2e-selenium y resume qué quedó cubierto.
```

Punto de atención para QA: si la regla nueva no está en las historias de usuario, es una
pregunta para el analista antes de darla por buena.

## Ejecutar las pruebas sin Bob

```bash
cd e2e-selenium
./mvnw test                          # en Windows: .\mvnw.cmd test
./mvnw test -Dtest=CuotasDoblesApiTest   # una sola clase
```

En Bob, el modo `qa-revisor` solo puede leer; `qa-automatizador` puede escribir y ejecutar,
pero únicamente dentro de `e2e-selenium/`. Bob pide permiso antes de ejecutar comandos.
