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
 * HU-07 · RF-07 — TEA del Crédito Hipotecario (rango vigente 9.80% - 14.90%).
 *
 * <p>Localizadores tomados de frontend/src/components (Step1Producto.tsx, Step2Condiciones.tsx,
 * SimuladorForm.tsx): aria-label del producto, id del campo TEA y texto de los botones.
 */
@DisplayName("HU-07 · RF-07 — TEA Hipotecario (pantalla)")
class TeaHipotecarioUiTest {

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

    @Test
    @DisplayName("TEA dentro del rango (12.00%): muestra la cuota mensual estimada")
    void teaDentroDelRangoMuestraCuota() {
        simularHipotecarioConTea("12.00");

        WebElement cuota = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(),'CUOTA MENSUAL ESTIMADA')]")));
        assertTrue(cuota.isDisplayed());
    }

    @Test
    @DisplayName("TEA fuera del rango (20.00%): rechaza e indica el rango válido")
    void teaFueraDelRangoMuestraError() {
        simularHipotecarioConTea("20.00");

        WebElement error = espera.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".sim-field-errors")));
        assertTrue(error.getText().contains("la TEA debe estar entre 0.098 y 0.149"),
            "Mensaje recibido: " + error.getText());
    }

    /** Paso 1: Hipotecario · Paso 2: TEA · Paso 3: valores por defecto · envía la simulación. */
    private void simularHipotecarioConTea(String teaPorcentaje) {
        espera.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[role='radio'][aria-label='Crédito Hipotecario']"))).click();
        continuar();

        WebElement tea = espera.until(ExpectedConditions.elementToBeClickable(By.id("tasa-tea")));
        ingresarValor(tea, teaPorcentaje);
        espera.until(ExpectedConditions.attributeToBe(tea, "value", teaPorcentaje + "%"));
        continuar();

        continuar();
    }

    /**
     * El campo TEA reformatea su valor en cada tecla ("12" se volvería "1.00%2"), así que se
     * ingresa el valor completo de una vez, como cuando el usuario lo pega.
     */
    private void ingresarValor(WebElement campo, String valor) {
        ((JavascriptExecutor) driver).executeScript(
            "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
                + "setter.call(arguments[0], arguments[1]);"
                + "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
            campo, valor);
    }

    private void continuar() {
        espera.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Continuar']"))).click();
    }
}
