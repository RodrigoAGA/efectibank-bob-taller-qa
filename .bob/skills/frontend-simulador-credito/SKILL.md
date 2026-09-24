---
name: frontend-simulador-credito
description: Implementa una interfaz Carbon accesible conectada a la API.
---

Objetivo: conservar una experiencia Carbon accesible mientras el frontend se
conecta a la API del Simulador de Crédito.

Fuentes obligatorias: el frontend generado desde Figma,
docs/arquitectura/api-boundaries.md y la respuesta real de POST
/api/simulaciones. Antes de modificar un componente, identifica el RF, estado
de UI y campo del contrato que afecta.

Reglas: usa componentes Carbon y labels/roles accesibles; prueba por role,
label o test id estable; muestra ayuda, validación y errores por campo; maneja
carga, éxito y error de red. Período de gracia y cuotas dobles existen solo
para Consumo. El resultado y cronograma se renderizan desde la respuesta API,
no desde cálculos o tasas en el navegador.

Límites y verificación: usa variables de entorno locales, no credenciales;
conserva mocks solo para stories o pruebas; antes de editar enumera archivos;
después ejecuta test y build e informa qué flujo manual validaste.
