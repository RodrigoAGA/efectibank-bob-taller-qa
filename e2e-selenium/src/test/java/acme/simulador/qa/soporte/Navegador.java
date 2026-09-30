package acme.simulador.qa.soporte;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;

/** Crea el navegador indicado en {@link Entorno#NAVEGADOR}. Selenium Manager descarga el driver. */
public final class Navegador {

    private Navegador() {
    }

    public static WebDriver abrir() {
        WebDriver driver;
        if ("edge".equalsIgnoreCase(Entorno.NAVEGADOR)) {
            EdgeOptions opciones = new EdgeOptions();
            if (Entorno.HEADLESS) {
                opciones.addArguments("--headless=new");
            }
            driver = new EdgeDriver(opciones);
        } else {
            ChromeOptions opciones = new ChromeOptions();
            if (Entorno.HEADLESS) {
                opciones.addArguments("--headless=new");
            }
            driver = new ChromeDriver(opciones);
        }
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1366, 900));
        return driver;
    }
}
