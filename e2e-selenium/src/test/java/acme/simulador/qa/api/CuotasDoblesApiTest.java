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
 * HU-10 · RF-10 — Cuotas dobles (solo Crédito al Consumo).
 *
 * <p>Se prueba por API porque la pantalla no expone un control para activar cuotas dobles.
 * Contrato: backend/src/validation/simulacionValidator.ts y backend/src/routes/simulaciones.ts.
 *
 * <p>Regla del validador:
 * - {@code cuotasDobles=true} solo es válido cuando {@code productoCodigo="CONSUMO"}.
 * - {@code cuotasDobles=false} (o ausente) se acepta en cualquier producto.
 * - El Tarifario confirma que AUTOMOTRIZ, COMERCIAL e HIPOTECARIO tienen
 *   {@code permiteCuotasDobles=false}.
 */
@DisplayName("HU-10 · RF-10 — Cuotas dobles (API)")
class CuotasDoblesApiTest {

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

    // -----------------------------------------------------------------------
    // Clases válidas
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Clase válida: CONSUMO con cuotasDobles=true → 201 y resumen refleja true")
    void aceptaCuotasdoblesEnConsumo() {
        Map<String, Object> body = solicitudConsumo();
        body.put("cuotasDobles", true);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(201)
            .body("simulacionId", notNullValue())
            .body("resumen.cuotasDobles", equalTo(true));
    }

    @Test
    @DisplayName("Clase válida: CONSUMO con cuotasDobles=false → 201 y resumen refleja false")
    void aceptaCuotasdoblesFalseEnConsumo() {
        Map<String, Object> body = solicitudConsumo();
        body.put("cuotasDobles", false);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(201)
            .body("simulacionId", notNullValue())
            .body("resumen.cuotasDobles", equalTo(false));
    }

    @Test
    @DisplayName("Omisión: CONSUMO sin cuotasDobles → 201 y resumen refleja false (valor por defecto)")
    void aceptaConsumoSinCuotasdobles() {
        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(solicitudConsumo())
            .when().post("/api/simulaciones")
            .then().statusCode(201)
            .body("resumen.cuotasDobles", equalTo(false));
    }

    // -----------------------------------------------------------------------
    // Clases inválidas — producto no elegible
    // -----------------------------------------------------------------------

    @ParameterizedTest(name = "{0} con cuotasDobles=true → 400")
    @ValueSource(strings = {"AUTOMOTRIZ", "COMERCIAL", "HIPOTECARIO"})
    @DisplayName("Clase inválida: producto que no permite cuotas dobles es rechazado con 400")
    void rechazaCuotasdoblesEnProductoNoElegible(String producto) {
        // TEA ajustada al rango de cada producto (tarifario-seed.json):
        // AUTOMOTRIZ: [0.40, 1.1413], COMERCIAL: [0.45, 1.1413], HIPOTECARIO: [0.098, 0.149]
        double tea = producto.equals("HIPOTECARIO") ? 0.12 : 0.50;

        Map<String, Object> body = solicitudConsumo();
        body.put("productoCodigo", producto);
        body.put("tea", tea);
        body.put("cuotasDobles", true);

        given().baseUri(Entorno.URL_API).contentType(ContentType.JSON).body(body)
            .when().post("/api/simulaciones")
            .then().statusCode(400)
            .body("errors.cuotasDobles", containsString("Consumo"));
    }
}
