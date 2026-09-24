# Lab 00 — Setup y acuerdos de Bob

## 1. Objetivo del lab

Prepara Bob y crea una regla global que guíe el trabajo durante el SDLC. La
regla vive en `~/.bob/rules/` y se aplica a todos los proyectos.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| Participante | Verifica Bob y crea la regla general de ingeniería. |
| Tech Lead | Define las convenciones generales que deberá aplicar Bob. |

## 2. Prerrequisitos

- Bob IDE instalado y con una licencia activa.
- Un workspace abierto en Bob para enviar el mensaje de creación; puede ser esta
  carpeta del bootcamp.

## 3. Paso a paso con Bob

### Paso 1 — Crear la regla global

Abre un workspace en Bob y selecciona un modo que permita editar archivos. En el
chat de Bob, copia y envía este mensaje completo:

```markdown
Crea una regla global para Bob con lo siguiente:

# Acuerdos generales
- Usa camelCase para variables y funciones, PascalCase para componentes, clases y tipos,
  y kebab-case para nombres de archivos.
- Mantén el código y los identificadores técnicos en inglés; escribe documentación funcional,
  descripciones de PR y explicaciones al negocio en español.
- Antes de editar, indica los archivos que esperas modificar y los supuestos relevantes.
- No inventes requisitos, políticas, cifras ni fórmulas: declara la duda o el supuesto.
- Antes de ejecutar una acción destructiva o que cambie dependencias, pide confirmación.
- Al terminar, resume los cambios realizados y las validaciones ejecutadas.
- Incluye o actualiza pruebas cuando cambie comportamiento observable.
```

Cuando Bob termine, confirma que se creó la regla global.

> No incluyas secretos. Las reglas específicas de cálculo, UX, QA y release se
> definen en los Skills y en los pasos de los labs correspondientes.

### Paso 2 — Crear la regla de activación automática de Skills

Los Skills del proyecto deben estar activos **desde el inicio de cada
conversación**, sin importar el modo o el lab en el que estés trabajando. Si un
Skill se crea y se intenta usar en la misma conversación, Bob no lo encuentra
porque aún no lo ha indexado — esto produce el error `Skill "..." not found`.

La solución es una **regla de proyecto** (`.bob/rules/`) que instruye a Bob a
activar todos los Skills automáticamente al arrancar **en cualquier modo**.
Abre un workspace en Bob con cualquier modo que permita editar archivos y envía
este mensaje:

    Crea el archivo .bob/rules/00-activar-skills.md con este contenido exacto:

    # Activación de skills al inicio de conversación

    Al comenzar cualquier conversación, activa todas las siguientes skills antes
    de responder cualquier solicitud. Si una skill ya está activa en esta
    conversación, no la vuelvas a activar.

    Skills obligatorias para este proyecto:

    1. `trazabilidad-requisitos-credito`
    2. `reglas-negocio-credito`
    3. `arquitectura-simulador-credito`
    4. `frontend-simulador-credito`
    5. `validacion-simulador`
    6. `release-seguro-simulador`
    7. `respuesta-incidente-tarifario`

    Actívalas en paralelo. Si una skill no se encuentra, informa al usuario que
    debe verificar que el archivo `.bob/skills/<nombre>/SKILL.md` existe en el
    repositorio e iniciar una nueva conversación para que Bob la indexe.

Cuando Bob termine, **inicia una nueva conversación** (haz clic en `+` o en
"Start New Task" en el panel de Bob). A partir de ahí, Bob activará las 7
Skills automáticamente al inicio de **cualquier conversación**, sin importar
el modo que uses (qa-revisor, release-engineer, credit-backend-developer, etc.).

> ⚠️ **Por qué es necesario iniciar una nueva conversación:** Bob carga los
> Skills disponibles al comienzo de cada conversación. Un Skill recién creado
> no aparece en esa misma conversación porque Bob ya terminó de indexarlos al
> inicio. Iniciar una nueva conversación resuelve el problema para todos los
> labs y modos del proyecto.

### Paso 3 — Comprobar la regla (modo Ask)

Abre modo **Ask** y usa este prompt para validar la función de reglas:

    Sin modificar archivos, indica qué convenciones globales aplicarías si este
    proyecto incluyera un componente de interfaz, una función de cálculo y una
    documentación funcional. Si falta información, enumera los supuestos en
    lugar de inventarlos.

## 4. Al completar el lab

- Verificaste que Bob puede responder en modo Ask.
- Creaste una regla global en `~/.bob/rules/`, aplicable a todos los proyectos y
  modos.
- Creaste la regla `.bob/rules/00-activar-skills.md` para que las 7 Skills base
  del proyecto se activen automáticamente al inicio de cualquier conversación,
  en cualquier modo y para cualquier lab. La skill `planificacion-simulador-credito`
  se crea y activa en el Lab 01.
