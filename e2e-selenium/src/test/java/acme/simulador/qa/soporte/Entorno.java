package acme.simulador.qa.soporte;

/**
 * Direcciones y opciones de ejecución. Se cambian con -D al ejecutar, por ejemplo:
 * ./mvnw test -Dnavegador=edge -Dheadless=true
 */
public final class Entorno {

    public static final String URL_FRONTEND = System.getProperty("urlFrontend", "http://localhost:5173");
    public static final String URL_API = System.getProperty("urlApi", "http://localhost:3001");
    /** Edge en Windows (viene instalado), Chrome en el resto. */
    public static final String NAVEGADOR = System.getProperty("navegador",
            System.getProperty("os.name", "").toLowerCase().contains("win") ? "edge" : "chrome");
    public static final boolean HEADLESS = Boolean.parseBoolean(System.getProperty("headless", "false"));

    private Entorno() {
    }
}
