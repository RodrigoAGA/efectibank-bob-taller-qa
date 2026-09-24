# Historias de usuario refinadas — Simulador de Crédito

> Refinamiento de RF-01 a RF-18 del PRD (`prd/PRD_Simulador_de_Credito_v2.pdf`, sección 4) a formato INVEST,
> con criterios de aceptación Gherkin más granulares que los del PRD original.
>
> **Nota sobre agrupación por épica:** las épicas de abajo son una agrupación propuesta a partir del
> PRD, para que la matriz de trazabilidad y el plan de pruebas tengan una agrupación consistente. Si se
> completa el Lab 01 (`docs/plan/epicas-priorizadas.md`), puede reemplazarse por esa priorización.

## Épica 1 — Configuración de la simulación
Cubre cómo el usuario elige su línea de crédito y configura los parámetros base antes del cálculo.

### HU-01 — Selección de línea de producto
**RF relacionado:** RF-01
**Como** cliente prospecto o asesor comercial
**Quiero** elegir una única línea de crédito entre las disponibles (Consumo, Automotriz, Comercial, Hipotecario)
**Para** empezar una simulación acorde a mi necesidad de financiamiento

```gherkin
Dado que ingreso al simulador sin ninguna línea seleccionada
Cuando visualizo las líneas de producto disponibles
Entonces veo una tarjeta por cada línea con su nombre y descripción

Dado que visualizo las líneas de producto
Cuando selecciono una de ellas
Entonces esa línea queda marcada como seleccionada y las demás no

Dado que ya tengo una línea seleccionada
Cuando selecciono una línea distinta
Entonces la selección anterior se reemplaza por la nueva (selección exclusiva, no múltiple)
```

### HU-02 — Habilitar campos según la línea seleccionada
**RF relacionado:** RF-02
**Como** cliente prospecto
**Quiero** que el formulario muestre solo los campos y parámetros aplicables a la línea que elegí
**Para** no confundirme llenando datos que no corresponden a mi tipo de crédito

```gherkin
Dado que seleccioné una línea de producto
Cuando avanzo a la pantalla de configuración
Entonces el sistema habilita los campos correspondientes a esa línea (monto, plazo, tasa, y campos condicionales como período de gracia o cuotas dobles solo si la línea los permite)

Dado que la línea seleccionada es Automotriz, Comercial o Hipotecario
Cuando configuro la simulación
Entonces no veo los campos de período de gracia ni de cuotas dobles, porque no aplican a esas líneas

Dado que la línea seleccionada es Consumo
Cuando configuro la simulación
Entonces el sistema me informa que el período de gracia y las cuotas dobles están disponibles para esta línea
```

### HU-03 — Validar los datos ingresados
**RF relacionado:** RF-04
**Como** cliente prospecto
**Quiero** que el sistema valide en el momento los datos que ingreso
**Para** corregir errores antes de intentar generar una simulación inválida

```gherkin
Dado que ingreso un valor que incumple una regla configurada (ej. monto en cero, tasa fuera de rango, plazo no numérico)
Cuando el sistema valida el campo
Entonces muestra un mensaje de error asociado a ese campo específico, indicando cómo corregirlo

Dado que existen datos incompletos o inválidos en la pantalla actual
Cuando intento avanzar al siguiente paso o ejecutar la simulación
Entonces el sistema bloquea el avance hasta que los datos sean corregidos

Dado que corrijo un dato marcado como inválido
Cuando el valor pasa a cumplir la regla configurada
Entonces el mensaje de error desaparece y puedo continuar
```

### HU-04 — Elegir el plazo de financiamiento
**RF relacionado:** RF-05
**Como** cliente prospecto
**Quiero** elegir entre los plazos de financiamiento disponibles para la línea seleccionada
**Para** ajustar el crédito a mi capacidad de pago mensual

```gherkin
Dado que seleccioné una línea de producto
Cuando visualizo las opciones de plazo
Entonces el sistema muestra únicamente los plazos aplicables a esa línea

Dado que visualizo las opciones de plazo
Cuando selecciono una de ellas
Entonces el plazo elegido queda reflejado en el resto del formulario y en el cálculo posterior
```

### HU-05 — Configurar el período de gracia (solo Consumo)
**RF relacionado:** RF-06
**Como** cliente prospecto que simula un Crédito al Consumo
**Quiero** poder seleccionar un período de gracia de 30 o 60 días
**Para** postergar el inicio de mis pagos cuando lo necesite

```gherkin
Dado que la línea de producto seleccionada es Consumo (permite período de gracia)
Cuando configuro las condiciones de la simulación
Entonces el sistema muestra las opciones de 30 y 60 días como período de gracia

Dado que selecciono un período de gracia de 30 o 60 días
Cuando ejecuto la simulación
Entonces el sistema pospone el cobro de cuotas durante ese período y capitaliza el interés generado, incorporándolo al cálculo posterior de la cuota

Dado que intento configurar un período de gracia con un valor distinto de 30 o 60 días
Cuando el sistema valida la simulación
Entonces rechaza la solicitud indicando que solo se aceptan 30 o 60 días

Dado que la línea de producto seleccionada es Automotriz, Comercial o Hipotecario
Cuando intento aplicar un período de gracia
Entonces el sistema rechaza la solicitud, ya que esta opción no aplica a esas líneas
```

## Épica 2 — Motor de cálculo financiero
Cubre las reglas y fórmulas que transforman los datos ingresados en montos, tasas, cuotas y fechas.

### HU-06 — Calcular el monto financiado
**RF relacionado:** RF-03
**Como** cliente prospecto
**Quiero** que el sistema calcule automáticamente el monto a financiar
**Para** saber cuánto de mi crédito realmente se financiará después de mi cuota inicial y el bono aplicable

```gherkin
Dado que ingresé correctamente el valor del bien, la cuota inicial y el bono (cuando aplican)
Cuando el sistema procesa la información
Entonces calcula el monto financiado como (valor del bien - cuota inicial - bono) y lo muestra al usuario

Dado que la cuota inicial y el bono suman un monto igual al valor del bien
Cuando el sistema calcula el monto financiado
Entonces el resultado es 0 y el sistema lo refleja sin generar un error de cálculo
```

### HU-07 — Aplicar la tasa correspondiente
**RF relacionado:** RF-07
**Como** cliente prospecto
**Quiero** que el sistema aplique la tasa vigente de la línea de producto que elegí
**Para** ver una simulación acorde a las condiciones reales del mercado

```gherkin
Dado que completé los datos requeridos para una línea de producto
Cuando el sistema procesa la simulación
Entonces aplica y muestra la TEA configurada para esa línea, dentro de su rango mínimo y máximo vigente

Dado que ingreso una TEA fuera del rango mínimo-máximo definido para la línea seleccionada
Cuando el sistema valida la simulación
Entonces rechaza la solicitud e indica el rango válido para esa línea
```

### HU-08 — Calcular la cuota estimada
**RF relacionado:** RF-08
**Como** cliente prospecto
**Quiero** ver la cuota mensual estimada de mi crédito
**Para** entender cuánto pagaría cada mes antes de solicitar el crédito formalmente

```gherkin
Dado que el monto financiado, la tasa y el plazo son válidos
Cuando el sistema ejecuta la simulación
Entonces calcula la cuota estimada usando el sistema de amortización francesa y la muestra al usuario

Dado que cambio el plazo o la tasa antes de confirmar
Cuando el sistema recalcula
Entonces la cuota estimada se actualiza de forma consistente con las fórmulas definidas
```

### HU-09 — Calcular los intereses del financiamiento
**RF relacionado:** RF-09
**Como** cliente prospecto
**Quiero** ver cuánto de mi pago corresponde a intereses
**Para** entender el costo real de mi crédito, no solo la cuota mensual

```gherkin
Dado que los datos y parámetros requeridos son válidos
Cuando el sistema ejecuta la simulación
Entonces calcula el interés de cada período sobre el saldo pendiente y el total de intereses del crédito

Dado que el saldo pendiente disminuye período a período
Cuando el sistema calcula el interés del siguiente período
Entonces el interés es proporcional al nuevo saldo, no al saldo original
```

### HU-10 — Aplicar cuotas dobles (solo Consumo)
**RF relacionado:** RF-10
**Como** cliente prospecto que simula un Crédito al Consumo
**Quiero** poder activar cuotas dobles
**Para** aprovechar mis ingresos extraordinarios (gratificación) y ver cómo reducen mi deuda

```gherkin
Dado que la línea de producto seleccionada es Consumo y permite cuotas dobles
Cuando activo la opción de cuotas dobles y ejecuto la simulación
Entonces el sistema aplica un pago adicional en los períodos que correspondan y lo refleja en el cronograma de pagos

Dado que activé cuotas dobles
Cuando reviso el cronograma
Entonces los períodos con pago adicional quedan identificados y el saldo pendiente se reduce más rápido que sin esta opción

Dado que la línea de producto seleccionada es Automotriz, Comercial o Hipotecario
Cuando intento activar cuotas dobles
Entonces el sistema rechaza la solicitud, ya que esta opción no aplica a esas líneas
```

### HU-11 — Calcular la fecha de la primera cuota
**RF relacionado:** RF-11
**Como** cliente prospecto
**Quiero** saber cuándo vencerá mi primera cuota
**Para** planificar mi flujo de caja desde el desembolso

```gherkin
Dado que ingresé una fecha referencial de desembolso y un día de pago válido
Cuando el sistema procesa la simulación
Entonces calcula y muestra la fecha referencial de la primera cuota de acuerdo con el día de pago configurado

Dado que la línea de producto tiene período de gracia activo
Cuando el sistema calcula la fecha de la primera cuota
Entonces la fecha se desplaza para reflejar que la primera cuota se cobra después de finalizado el período de gracia

Dado que el día de pago configurado no existe en el mes calculado (ej. día 31 en febrero)
Cuando el sistema calcula la fecha de la cuota
Entonces ajusta la fecha al último día válido de ese mes
```

### HU-12 — Configurar el seguro de desgravamen
**RF relacionado:** RF-12
**Como** cliente prospecto
**Quiero** decidir si incluyo seguro de desgravamen y en qué modalidad
**Para** proteger mi crédito o mantener una cuota más baja, según lo que prefiera

```gherkin
Dado que el seguro de desgravamen aplica a la simulación
Cuando selecciono la modalidad "Sin devolución"
Entonces el sistema aplica la tasa de 0.40% mensual sobre el saldo pendiente y refleja el importe en la cuota y el cronograma

Dado que el seguro de desgravamen aplica a la simulación
Cuando selecciono la modalidad "Con devolución"
Entonces el sistema aplica la tasa de 0.72% mensual sobre el saldo pendiente y refleja el importe en la cuota y el cronograma

Dado que ya tengo un resultado calculado
Cuando cambio de modalidad de seguro
Entonces el sistema recalcula la cuota total con la nueva tasa
```

## Épica 3 — Resultado y trazabilidad
Cubre cómo se presenta, exporta y conserva la simulación una vez calculada.

### HU-13 — Visualizar el resumen de la simulación
**RF relacionado:** RF-13
**Como** cliente prospecto
**Quiero** ver un resumen claro de mi simulación
**Para** entender de un vistazo las condiciones principales de mi crédito

```gherkin
Dado que la simulación se procesó correctamente
Cuando visualizo los resultados
Entonces veo al menos la cuota estimada, los intereses totales, el seguro aplicable, el monto financiado y el acceso al cronograma de pagos

Dado que visualizo el resultado
Cuando reviso la información
Entonces la información principal (cuota, monto) se distingue visualmente de la información complementaria (desglose, fechas)
```

### HU-14 — Consultar el cronograma de pagos
**RF relacionado:** RF-14
**Como** cliente prospecto
**Quiero** ver el detalle período por período de mi crédito
**Para** entender cómo se compone cada cuota a lo largo del tiempo

```gherkin
Dado que generé una simulación válida
Cuando abro el cronograma de pagos
Entonces veo una fila por período con capital, interés, seguro, cuota total y saldo pendiente

Dado que el crédito incluye período de gracia o cuotas dobles
Cuando reviso el cronograma
Entonces esos períodos quedan identificados de forma distinguible del resto

Dado que reviso la última fila del cronograma
Cuando la simulación llega al final del plazo
Entonces el saldo pendiente de esa fila es 0
```

### HU-15 — Exportar el resultado de la simulación
**RF relacionado:** RF-15
**Como** cliente prospecto
**Quiero** descargar el resultado de mi simulación
**Para** conservarlo o compartirlo antes de decidir solicitar el crédito

```gherkin
Dado que generé una simulación válida
Cuando solicito exportar el resultado
Entonces el sistema genera un archivo descargable con el resumen y el cronograma completo

Dado que exporté una simulación
Cuando abro el archivo generado
Entonces los valores coinciden exactamente con los mostrados en pantalla
```

### HU-16 — Ver mensajes informativos y disclaimers
**RF relacionado:** RF-16
**Como** cliente prospecto
**Quiero** ver claramente que la simulación es referencial
**Para** no confundirla con una aprobación real de crédito

```gherkin
Dado que visualizo el resultado de una simulación
Cuando el sistema presenta la información calculada
Entonces muestra un mensaje visible indicando que las cifras son referenciales y no constituyen una aprobación de crédito

Dado que estoy revisando el resultado
Cuando busco el disclaimer
Entonces lo encuentro visible junto al resultado, sin necesidad de desplazarme ni abrir otra sección
```

### HU-17 — Contactar a un asesor comercial
**RF relacionado:** RF-17
**Como** cliente prospecto
**Quiero** contactar a un asesor comercial directamente desde el resultado de mi simulación
**Para** continuar el proceso de solicitud si las condiciones simuladas me convencen

```gherkin
Dado que visualizo el resultado de una simulación válida
Cuando reviso la pantalla de resultado
Entonces veo un botón visible para contactar a un asesor comercial

Dado que hago clic en el botón de contacto
Cuando el sistema procesa la acción
Entonces envía la información de contexto de mi simulación (línea de producto, monto financiado, plazo, cuota estimada) junto con la solicitud de contacto

Dado que el envío del contacto falla por un problema de comunicación
Cuando intento contactar al asesor
Entonces el sistema me informa que no se pudo enviar la solicitud y me permite reintentar
```

### HU-18 — Registrar la simulación generada
**RF relacionado:** RF-18
**Como** asesor comercial o equipo de negocio
**Quiero** que cada simulación válida quede registrada
**Para** consultarla luego o darle trazabilidad durante el proceso de venta

```gherkin
Dado que un usuario genera una simulación válida
Cuando el sistema finaliza el cálculo
Entonces registra los datos ingresados, las condiciones aplicadas y los resultados obtenidos, con un identificador único

Dado que una simulación fue registrada
Cuando se consulta ese identificador
Entonces se puede recuperar la información completa de esa simulación tal como fue calculada

Dado que el sistema no logra completar el cálculo (datos inválidos)
Cuando la simulación falla la validación
Entonces no se registra ninguna simulación incompleta o inválida
```
