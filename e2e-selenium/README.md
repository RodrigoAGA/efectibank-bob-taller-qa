# Pruebas automatizadas del Simulador de Crédito (Selenium + REST Assured)

Proyecto Java de la sesión 2 del taller: pruebas de pantalla con **Selenium WebDriver** y
pruebas de API con **REST Assured**, ejecutadas con **JUnit 5** y **Maven**.

| Prueba | Requisito | Qué valida |
|---|---|---|
| `api/PeriodoGraciaApiTest` | HU-05 · RF-06 | Período de gracia por API: 30 y 60 días se aceptan en Consumo; otros valores y otros productos se rechazan. |
| `ui/TeaHipotecarioUiTest` | HU-07 · RF-07 | TEA del Crédito Hipotecario en pantalla: dentro del rango muestra la cuota; fuera del rango indica el rango válido. |

## Requisitos

- Java 17 o superior.
- Google Chrome o Microsoft Edge.
- El simulador levantado (ver el `README.md` de la raíz): backend en `http://localhost:3001` y
  frontend en `http://localhost:5173`.

No hace falta instalar Maven: el proyecto trae Maven Wrapper (`mvnw`). La primera ejecución
descarga Maven, las dependencias y el driver del navegador.

## Cómo ejecutarlo

```bash
cd e2e-selenium
./mvnw test                                   # todas las pruebas (Edge en Windows, Chrome en el resto)
./mvnw test -Dnavegador=chrome                # forzar un navegador (chrome o edge)
./mvnw test -Dheadless=true                   # sin abrir la ventana del navegador
./mvnw test -Dtest=PeriodoGraciaApiTest       # solo una clase de pruebas
```

En Windows se usa `mvnw.cmd` en lugar de `./mvnw`.

Si la red no permite descargar el driver del navegador, se baja a mano la versión que coincide
con el navegador instalado (Edge: `https://msedgedriver.microsoft.com/<versión>/edgedriver_win64.zip`)
y se deja `msedgedriver.exe` en una carpeta del `PATH`.
