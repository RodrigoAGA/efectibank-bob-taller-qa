package acme.simulador.qa.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import acme.simulador.qa.soporte.Entorno;
import io.restassured.http.ContentType;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * HU-05 · RF-06 — Período de gracia (solo Crédito al Consumo).
 *
 * <p>Se prueba por API porque la pantalla no tiene un control para elegir el período de gracia.
 * Contrato: backend/src/validation/simulacionValidator.ts y backend/src/routes/simulaciones.ts.
 */
@DisplayName("HU-05 · RF-06 — Período de gracia (API)")
class PeriodoGraciaApiTest {

    /** Solicitud válida de Consumo; cada prueba cambia solo el dato que quiere probar. */
    private static Map<String, Object> solicitudConsumo() {
        Map<String, Object> body = new HashMap<>();
        body.put("productoCodigo", "CONSUMO");
        body.put("valorBien", 10000);
        body.put("cuotaInicialPct", 0);
        body.put("bono", 0);
        body.put("tea", 0.30);
        body.put("plazoMeses", 12);
        body.put("fechaDesembolso", "2026-10-15");
        body.put("diaPago", 15);
        body.put("seguroActivo", false);
        return body;
    }

    @ParameterizedTest(name = "Consumo con {0} días de gracia → 201")
    @ValueSource(ints = {30, 60})
    @DisplayName("Clase válida: 30 y 60 días se aceptan en Consumo")
    void aceptaGraciaValidaEnConsumo(int dias) {
        Map<String, Object> body = solicitudConsumo();
        body.put("periodoGraciaDias", dias);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(201)
            .body("simulacionId", notNullValue())
            .body("resumen.periodoGraciaDias", equalTo(dias));
    }

    @ParameterizedTest(name = "Consumo con {0} días de gracia → 400")
    @ValueSource(ints = {0, 29, 31, 45, 59, 61, 90})
    @DisplayName("Clase inválida y valores límite: cualquier valor distinto de 30 o 60 se rechaza")
    void rechazaGraciaFueraDeDominio(int dias) {
        Map<String, Object> body = solicitudConsumo();
        body.put("periodoGraciaDias", dias);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(400)
            .body("errors.periodoGraciaDias", containsString("30 o 60"));
    }

    @Test
    @DisplayName("Producto incorrecto: Hipotecario con 30 días de gracia se rechaza")
    void rechazaGraciaEnOtroProducto() {
        Map<String, Object> body = solicitudConsumo();
        body.put("productoCodigo", "HIPOTECARIO");
        body.put("tea", 0.12);
        body.put("periodoGraciaDias", 30);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(400)
            .body("errors.periodoGraciaDias", containsString("Crédito al Consumo"));
    }

    @Test
    @DisplayName("Sin valor: sin período de gracia la simulación de Consumo es válida")
    void aceptaConsumoSinGracia() {
        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(solicitudConsumo())
            .when().post("/api/simulaciones")
            .then().statusCode(201)
            .body("resumen.periodoGraciaDias", equalTo(null));
    }
}
