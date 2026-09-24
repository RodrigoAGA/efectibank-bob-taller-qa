# Glosario de negocio — Simulador de Crédito

> Términos clave del PRD (sección 5, Reglas de negocio) explicados en lenguaje simple para el equipo
> técnico que construye e integra el simulador.

**TEA (Tasa Efectiva Anual)**
Es el costo o rendimiento de un crédito expresado como porcentaje anual, e incluye el efecto de la
capitalización de intereses a lo largo del año (no es una tasa simple). Cada línea de producto tiene un
rango de TEA mínima y máxima publicado (por ejemplo, Crédito al Consumo va de 15.99% a 114.13%); la
tasa final que se le asigna a un cliente real depende de su evaluación crediticia, pero en el simulador
solo se usa como valor referencial dentro de ese rango.

**TEM (Tasa Efectiva Mensual)**
Es la TEA "traducida" a una tasa mensual equivalente, porque las cuotas de un crédito se pagan mes a
mes, no una vez al año. Se calcula con la fórmula `TEM = (1 + TEA)^(1/12) - 1`. Es la tasa que realmente
se usa para calcular cuánto interés genera el saldo pendiente cada mes.

**Cuota inicial**
Es el monto que el cliente paga por adelantado, de su propio bolsillo, antes de que el banco financie el
resto. Reduce el monto que finalmente se financia. Por ejemplo, si el bien cuesta S/ 50,000 y la cuota
inicial es 10%, el cliente pone S/ 5,000 y el banco financia el resto.

**Bono**
Es un beneficio o descuento (por ejemplo, de una campaña comercial) que también reduce el monto a
financiar, igual que la cuota inicial, pero no sale del bolsillo del cliente — lo asume el banco o un
tercero (como el vendedor del bien) como parte de una promoción.

**Monto financiado**
Es la parte del valor del bien que efectivamente se convierte en deuda con el banco, después de restar
la cuota inicial y el bono. Fórmula: `Monto financiado = Valor del bien - Cuota inicial - Bono`. Es el
monto sobre el cual se calculan la cuota, los intereses y el cronograma de pagos.

**Período de gracia**
Es un tiempo (30 o 60 días, solo disponible en Crédito al Consumo) durante el cual el cliente no paga
cuotas todavía, aunque el crédito ya se desembolsó. Ojo: durante ese tiempo el interés se sigue
generando sobre el capital; simplemente se "acumula" y se suma al cálculo de la cuota una vez que el
período de gracia termina. No es un período gratis, es un período donde se pospone el primer pago.

**Cuotas dobles**
Es una opción (solo disponible en Crédito al Consumo) que le permite al cliente pagar un monto extra en
ciertos meses del año — pensada para aprovechar ingresos extraordinarios como la gratificación de julio
y diciembre en Perú. Ese pago adicional se aplica como amortización extra del capital, lo que reduce el
saldo pendiente más rápido y puede terminar de pagar el crédito antes del plazo original.

**Seguro de desgravamen (sin devolución / con devolución)**
Es un seguro asociado al crédito que cubre el saldo pendiente si el cliente fallece o queda con
incapacidad permanente, para que la deuda no recaiga en su familia. Tiene dos modalidades:
- **Sin devolución**: tasa más baja (0.40% mensual sobre el saldo pendiente), pero si el cliente cancela
  el crédito antes de tiempo, no le devuelven nada de lo pagado por seguro.
- **Con devolución**: tasa más alta (0.72% mensual sobre el saldo pendiente), pero si el cliente cancela
  antes de tiempo, sí le devuelven la parte proporcional de lo que pagó por seguro y no llegó a "usar".

El cliente elige la modalidad al configurar la simulación, y el sistema recalcula la cuota total según la
tasa que corresponda.
