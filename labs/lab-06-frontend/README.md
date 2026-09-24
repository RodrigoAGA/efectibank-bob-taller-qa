# Lab 06 — Desarrollo frontend

## Objetivo

Convertir el frontend inicial generado desde Figma en el Lab 04 en una interfaz
integrada con el backend real del Lab 05, con validaciones accesibles y estados
de carga, error y resultado.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| Frontend Developer | Implementa la interfaz y la integración HTTP. |
| UX/UI Designer | Valida consistencia con wireframes y Carbon. |
| QA Engineer | Revisa validaciones y accesibilidad antes de Testing/QA. |

## Antes de comenzar

Los siguientes artefactos ya están preparados en el repositorio:

- `frontend/` — código inicial generado desde Figma en el Lab 04, listo para integrar. Vive en la **raíz del repositorio**.
- `docs/arquitectura/api-boundaries.md` — límites de API del simulador.
- `.bob/custom_modes.yaml` — modo `credit-frontend-developer` ya configurado.
- `.bob/skills/frontend-simulador-credito/SKILL.md` — Skill ya creado.

## Paso 1 — Verificar que existe `frontend/`

Abre `frontend/` en la raíz del proyecto. Debe contener el código generado desde Figma:
componentes React, estilos Carbon y tipos. Es el punto de partida del lab —
no lo elimines ni lo reemplaces completo; el lab conserva lo útil y reemplaza
lo que no aplica.

## Paso 2 — Verificar el modo `credit-frontend-developer`

El modo ya está configurado en `.bob/custom_modes.yaml`. Verifica que `credit-frontend-developer` aparece en el selector de modos de Bob y selecciónalo antes de continuar.

## Paso 3 — Verificar el Skill `frontend-simulador-credito`

El Skill ya está creado en `.bob/skills/frontend-simulador-credito/SKILL.md`. Verifica que aparece en la pestaña **Skills** de Bob, aprueba su activación si Bob lo solicita y mantenlo activo para los pasos restantes.

## Paso 4 — Revisar la interfaz antes de editar

Selecciona **Ask**. En el chat de Bob, pega este prompt:

```text
Lee @docs/arquitectura/api-boundaries.md, el contrato o implementación de
POST /api/simulaciones y el código actual de @frontend. Enumera los componentes
generados desde Figma, los estados no cubiertos y las diferencias entre sus
cálculos o datos locales y la respuesta real esperada. No modifiques archivos.
Ten en cuenta que /frontend vive en la raíz del repositorio, no dentro del lab.
```

Revisa esa lista. Después vuelve a seleccionar `credit-frontend-developer` y
confirma que el Skill `frontend-simulador-credito` sigue activo.

## Paso 5 — Implementar formulario y resultado

En el chat de Bob, con el modo y Skill activos, envía este prompt:

```text
Con el Skill frontend-simulador-credito activo, actualiza los componentes del
frontend en /frontend que capturan datos y muestran el resultado. Conserva
la estructura y estilos útiles; muestra campos de período de gracia y cuotas
dobles solo para Consumo; agrega labels, ayuda y errores accesibles. Antes de
editar, enumera los archivos que cambiarás.
Ten en cuenta que /frontend vive en la raíz del repositorio, no dentro del lab.
```

Cuando Bob termine, ejecuta el frontend y comprueba manualmente que los campos de
gracia y cuotas dobles aparecen únicamente al elegir Consumo. Después continúa.

## Paso 6 — Integrar la API real

En el chat de Bob, sin cambiar de modo ni desactivar el Skill, envía:

```text
Conecta el formulario generado a POST /api/simulaciones. Obtén la URL del backend
desde una variable de entorno local. Reemplaza los cálculos financieros, tasas y
datos de fallback del navegador en el flujo principal por la respuesta de la API;
elimina o deja sin uso los hooks de cálculo local que ya no correspondan. Muestra
carga durante la solicitud, errores por campo cuando la API devuelva 400 y el
resumen más cronograma cuando sea exitosa. No agregues credenciales al repositorio.
```

Abre dos terminales integradas en Bob: en una ejecuta el backend y en otra el frontend.
Simula Consumo con datos válidos y confirma que cuota y cronograma coinciden con la
respuesta de red, no con el mock anterior.

## Paso 7 — Validar y preparar QA

En el chat de Bob, envía:

```text
Crea pruebas de componente para SimuladorForm. Verifica selección de producto,
campos exclusivos de Consumo, validación visible y envío exitoso. Usa roles y labels,
no clases CSS ni detalles internos.
```

Ejecuta `npm test` y `npm run build` en `frontend/` (en la raíz del repositorio). Si alguno falla, pega su salida
en el chat y pide que Bob corrija solo el error reportado. No continúes al Lab 07
hasta que ambos comandos terminen correctamente.

## Comprobación antes de continuar

El formulario debe enviar a la API real, mostrar errores de validación y renderizar
el resultado completo. Mantén `backend/` y `frontend/` en la raíz del repositorio para que
el Lab 07 pueda ejecutar pruebas unitarias, integración y E2E.
