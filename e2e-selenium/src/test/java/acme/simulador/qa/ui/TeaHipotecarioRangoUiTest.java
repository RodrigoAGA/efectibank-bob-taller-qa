package acme.simulador.qa.ui;

import static org.junit.jupiter.api.Assertions.assertTrue;

import acme.simulador.qa.soporte.Entorno;
import acme.simulador.qa.soporte.Navegador;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * HU-07 · RF-07 — Validación de rango de TEA para Crédito Hipotecario (pantalla).
 *
 * <p>Rango vigente (tarifario-seed.json): 9.80% (0.0980) – 14.90% (0.1490).
 *
 * <p>Localizadores obtenidos de:
 * <ul>
 *   <li>frontend/src/components/Step1Producto.tsx — role="radio" aria-label del producto</li>
 *   <li>frontend/src/components/Step2Condiciones.tsx — id="tasa-tea"</li>
 *   <li>frontend/src/components/SimuladorForm.tsx — botón "Continuar", clase .sim-field-errors</li>
 *   <li>frontend/src/components/Step4Resultado.tsx — role="region" aria-label="Cuota mensual estimada"</li>
 *   <li>backend/src/routes/simulaciones.ts — texto exacto del mensaje de error de TEA</li>
 * </ul>
 *
 * <p>Se prueba en pantalla porque la validación del rango de TEA es visible al usuario y
 * la pantalla expone el campo TEA (id="tasa-tea") en el Paso 2.
 */
@DisplayName("HU-07 · RF-07 — Rango de TEA Hipotecario (pantalla)")
class TeaHipotecarioRangoUiTest {

    /** Rango vigente extraído de backend/seed/tarifario-seed.json */
    private static final double TEA_MIN = 0.0980;
    private static final double TEA_MAX = 0.1490;

    /** Valor dentro del rango: 12.00% */
    private static final String TEA_VALIDA = "12.00";

    /** Valor límite inferior exacto: 9.80% (valor mínimo aceptado) */
    private static final String TEA_EN_LIMITE_MIN = "9.80";

    /** Valor límite superior exacto: 14.90% (valor máximo aceptado) */
    private static final String TEA_EN_LIMITE_MAX = "14.90";

    /** Un punto por debajo del mínimo: 9.79% → fuera de rango */
    private static final String TEA_BAJO_MINIMO = "9.79";

    /** Un punto por encima del máximo: 14.91% → fuera de rango */
    private static final String TEA_SOBRE_MAXIMO = "14.91";

    private WebDriver driver;
    private WebDriverWait espera;

    @BeforeEach
    void abrirSimulador() {
        driver = Navegador.abrir();
        espera = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get(Entorno.URL_FRONTEND);
    }

    @AfterEach
    void cerrar() {
        if (driver != null) {
            driver.quit();
        }
    }

    // -----------------------------------------------------------------------
    // Clase válida — TEA dentro del rango
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("CE válida: TEA 12.00% (dentro del rango 9.80%–14.90%) → muestra la cuota mensual estimada")
    void teaDentroRangoMuestraCuota() {
        navegarHastaResultadoConTea(TEA_VALIDA);

        // Step4Resultado.tsx:66 — <div role="region" aria-label="Cuota mensual estimada">
        WebElement region = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[role='region'][aria-label='Cuota mensual estimada']")));
        assertTrue(region.isDisplayed(),
            "La tarjeta 'Cuota mensual estimada' debe estar visible tras una TEA válida.");
    }

    // -----------------------------------------------------------------------
    // Valores límite exactos — fronteras del rango aceptado
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("VL mínimo exacto: TEA 9.80% → muestra la cuota mensual estimada")
    void teaLimiteInferiorMuestraCuota() {
        navegarHastaResultadoConTea(TEA_EN_LIMITE_MIN);

        WebElement region = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[role='region'][aria-label='Cuota mensual estimada']")));
        assertTrue(region.isDisplayed(),
            "TEA igual al mínimo (9.80%) debe ser aceptada.");
    }

    @Test
    @DisplayName("VL máximo exacto: TEA 14.90% → muestra la cuota mensual estimada")
    void teaLimiteSuperiorMuestraCuota() {
        navegarHastaResultadoConTea(TEA_EN_LIMITE_MAX);

        WebElement region = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[role='region'][aria-label='Cuota mensual estimada']")));
        assertTrue(region.isDisplayed(),
            "TEA igual al máximo (14.90%) debe ser aceptada.");
    }

    // -----------------------------------------------------------------------
    // Clase inválida — TEA fuera del rango
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("CE inválida: TEA 9.79% (bajo el mínimo) → muestra error con rango válido")
    void teaBajoMinimoMuestraError() {
        navegarHastaResultadoConTea(TEA_BAJO_MINIMO);

        // SimuladorForm.tsx:318 — <ul class="sim-field-errors">
        WebElement errores = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".sim-field-errors")));

        // Mensaje exacto de backend/src/routes/simulaciones.ts:36
        String texto = errores.getText();
        assertTrue(texto.contains("la TEA debe estar entre " + TEA_MIN + " y " + TEA_MAX),
            "El error debe indicar el rango válido. Mensaje recibido: " + texto);
    }

    @Test
    @DisplayName("CE inválida: TEA 14.91% (sobre el máximo) → muestra error con rango válido")
    void teaSobreMaximoMuestraError() {
        navegarHastaResultadoConTea(TEA_SOBRE_MAXIMO);

        WebElement errores = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".sim-field-errors")));

        String texto = errores.getText();
        assertTrue(texto.contains("la TEA debe estar entre " + TEA_MIN + " y " + TEA_MAX),
            "El error debe indicar el rango válido. Mensaje recibido: " + texto);
    }

    // -----------------------------------------------------------------------
    // Método de apoyo — recorrido de pantalla hasta el resultado
    // -----------------------------------------------------------------------

    /**
     * Paso 1: selecciona Hipotecario.
     * Paso 2: fija la TEA recibida; deja los demás campos con sus valores por defecto.
     * Paso 3: valores por defecto (sin opciones adicionales en Hipotecario).
     * El clic en Continuar del Paso 3 dispara la llamada a POST /api/simulaciones.
     *
     * <p>Localizadores:
     * <ul>
     *   <li>Step1Producto.tsx:54 — role="radio" aria-label={meta.label}</li>
     *   <li>Step2Condiciones.tsx:92 — id="tasa-tea"</li>
     *   <li>SimuladorForm.tsx:385 — button text "Continuar"</li>
     * </ul>
     */
    private void navegarHastaResultadoConTea(String teaPorcentaje) {
        // Paso 1 — seleccionar Crédito Hipotecario
        espera.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[role='radio'][aria-label='Crédito Hipotecario']"))).click();
        clickContinuar();

        // Paso 2 — fijar TEA; el campo usa un formato "%"; se inyecta via JS para evitar
        // conflictos con el reformateo carácter-a-carácter del componente Carbon TextInput.
        WebElement campotea = espera.until(
            ExpectedConditions.elementToBeClickable(By.id("tasa-tea")));
        inyectarValor(campotea, teaPorcentaje);
        // Esperar que el valor sea estabilizado por el componente React
        espera.until(ExpectedConditions.attributeToBe(campotea, "value", teaPorcentaje + "%"));
        clickContinuar();

        // Paso 3 — sin cambios (Hipotecario no tiene opciones adicionales)
        clickContinuar();
    }

    /**
     * Inyecta un valor en un campo Carbon/React saltando el reformateo carácter a carácter.
     * Técnica idéntica a la de TeaHipotecarioUiTest para mantener consistencia.
     */
    private void inyectarValor(WebElement campo, String valor) {
        ((JavascriptExecutor) driver).executeScript(
            "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
                + "setter.call(arguments[0], arguments[1]);"
                + "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
            campo, valor);
    }

    private void clickContinuar() {
        espera.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Continuar']"))).click();
    }
}
