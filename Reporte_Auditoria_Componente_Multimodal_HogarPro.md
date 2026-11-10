# Reporte de Auditoría del Componente Multimodal de HogarPro

> Actualización del comportamiento: por solicitud del usuario, se retiró el panel de casillas. Sonido y vibración están integrados y activos sin configuración. Una nota de 0,08 segundos reconoce el inicio del envío; el earcon de dos notas y la vibración se reservan al éxito. Las menciones posteriores a controles, opt-in y pruebas de desactivación corresponden a la versión anterior y quedan sin efecto. Las restricciones del navegador y el volumen del dispositivo pueden impedir el audio. No se ejecutó una nueva auditoría Lighthouse ni una prueba auditiva física.

## 1. Portada

**Actividad:** Implementación de un Componente Multimodal en Astro con Redundancia Sensorial.  
**Sistema:** HogarPro.  
**Fecha:** 9 de noviembre de 2026.  
**Estudiante:** [Completar nombre].  
**Docente y asignatura:** [Completar].  
**Alcance:** revisión de implementación, compilación, pruebas del controlador y comprobación HTTP. Auditoría instrumental y evaluación perceptual pendientes.

## 2. Introducción

La redundancia sensorial permite comunicar una misma confirmación mediante distintos canales. Esta implementación combina texto e iconos, un sonido breve y una vibración opcional. La información visual permanece disponible aunque el navegador bloquee las otras señales. La incorporación se realiza sobre la aplicación existente, conservando su formulario y sus servicios.

## 3. Objetivo de la actividad

Integrar una confirmación accesible de solicitudes en la etapa final del formulario de HogarPro, asociando las señales de éxito a la respuesta real del servidor y proporcionando una demostración independiente de MySQL.

## 4. Descripción del sistema HogarPro

HogarPro conecta clientes y profesionales de servicios domésticos en Tamburco y Abancay. El frontend está en `hogarpro/hogarpro-fronted` (nombre real del directorio), utiliza Astro y React; el backend se encuentra en `hogarpro/hogarpro-backend`.

La inspección identificó un asistente de tres pasos en `Requests.tsx`: problema, domicilio y revisión. La función `api()` envía cookies con `credentials: include`. El backend valida la sesión, exige el rol de cliente y recibe `POST /api/requests`. Antes de responder con HTTP 201 e identificador, ejecuta una transacción que registra la solicitud, su evento inicial y sus adjuntos. No se modificaron endpoints, esquema, datos ni credenciales.

## 5. Descripción del componente multimodal

`src/components/ConfirmarSolicitudMultimodal.astro` contiene el HTML semántico, controles, regiones de mensajes y estilos. Se entrega como contenido hijo de la isla React de la página; `App.tsx` lo transmite al asistente, que lo muestra exclusivamente en la revisión final. No se duplica el formulario.

El elemento `hp-confirmation` organiza el comportamiento mediante `src/lib/confirmation.ts`. El formulario real comunica los estados mediante el evento `confirmation-state`, después de iniciar o completar la operación existente. La página `/demo-multimodal` utiliza exactamente el mismo componente y controlador; su resultado simulado se identifica explícitamente y no realiza llamadas de guardado.

| Estado | Presentación |
| --- | --- |
| Inicial | Confirmar solicitud |
| Procesando | Procesando solicitud...; botón bloqueado e indicador |
| Éxito | Solicitud confirmada correctamente; marca e indicación textual |
| Error | No se pudo confirmar la solicitud. Inténtalo nuevamente; reintento habilitado |

## 6. Implementación de la estructura semántica

Se emplea un `button type="submit"` con nombre visible, controles `input type="checkbox"` envueltos en etiquetas y agrupación con `fieldset` y `legend`. El contenedor personalizado no reemplaza la semántica de los controles HTML. El estado ocupado se expone con `aria-busy` y el bloqueo con `disabled`. Los símbolos decorativos tienen `aria-hidden`.

Las regiones de estado y error existen antes de actualizar el resultado. `role="status"` anuncia procesamiento y éxito; `role="alert"` comunica el error. La implementación se corresponde con los principios de [nombre, función y valor del W3C](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html) y de [mensajes de estado](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html). La compatibilidad efectiva con lectores de pantalla requiere evaluación manual.

## 7. Retroalimentación visual

El botón adopta el color verde, bordes redondeados y tipografía del sistema. Al presionarlo se desplaza tres píxeles y reduce ligeramente su escala, recuperándose al soltarlo. El procesamiento presenta un indicador circular y texto; el éxito se identifica también mediante palabras y una marca, sin depender del color.

El foco utiliza un contorno de tres píxeles separado del control. La consulta `prefers-reduced-motion: reduce` elimina el giro, la transición y el desplazamiento; el texto continúa informando del progreso. El componente usa un ancho flexible limitado a 520 píxeles. Estos mecanismos fueron inspeccionados en el código, pero su apariencia móvil y su comportamiento perceptual no se verificaron en navegador.

## 8. Retroalimentación auditiva

El sonido está integrado y activo por defecto, sin casillas adicionales. Web Audio emite una nota de 440 Hz y 0,08 segundos al activar un envío válido. Cuando la operación se confirma, genera dos tonos de 660 y 880 Hz, con envolvente suave y duración total de 0,34 segundos. La nota inicial reconoce la pulsación; no representa éxito. Los fallos de creación o reproducción se aíslan para conservar la confirmación visual.

El criterio [WCAG 1.4.2](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html) se refiere al audio automático de más de tres segundos. Estos sonidos son más cortos y responden a una acción del usuario. No existe un control de habilitación en el componente. No se afirma haber comprobado físicamente su volumen o percepción.

## 9. Retroalimentación háptica

Se comprueba la existencia de `navigator.vibrate`. Cuando existe, el éxito puede emitir el patrón `[60, 40, 60]`: dos pulsos de 60 milisegundos con una pausa de 40. La vibración se intenta automáticamente, sin casillas adicionales. La ausencia de la API y las excepciones no interrumpen el formulario.

La presencia de la API no garantiza vibración física: influyen hardware, permisos, políticas del navegador y contexto seguro. Las pruebas automatizadas verificaron invocaciones con un sustituto de la API, no una vibración en un teléfono.

## 10. Sincronización multisensorial

La operación real activa procesamiento antes de llamar a `api('/requests', ...)`. Tras la respuesta satisfactoria se comprueba un identificador entero positivo y se emite un único evento de éxito. El controlador actualiza la interfaz y programa audio y vibración en ese mismo manejo de evento. No se promete simultaneidad física exacta entre dispositivos.

Se mantiene la confirmación visible durante 1,4 segundos antes de navegar al detalle existente. Las señales de éxito no se ejecutan al fallar la operación. Una referencia sincrónica `sending` impide envíos consecutivos antes del siguiente render de React; los controles de navegación y edición quedan bloqueados durante el envío. El controlador también ignora éxitos repetidos sin un procesamiento previo.

Esta protección evita duplicados por doble activación en el mismo formulario. No equivale a idempotencia del servidor: múltiples pestañas o un reintento tras una respuesta perdida podrían crear duplicados. Ante una interrupción de conexión, comprobar primero «Mis solicitudes». No se modificó el contrato del backend para resolver esa limitación.

## 11. Criterios WCAG 2.1 aplicados

Se han implementado recursos dirigidos a los criterios 4.1.2, 1.4.2, 2.1.1, 2.4.7, 1.4.3 y 4.1.3. La presencia de estos recursos no constituye una certificación WCAG de la página completa. Deben complementarse con auditoría instrumental y pruebas humanas.

## 12. Procedimiento de auditoría con Lighthouse o WAVE

Lighthouse no está instalado como comando en este entorno. El intento de abrir la demostración mediante la herramienta de navegador falló porque su host de acceso no estaba disponible. No se obtuvo puntuación Lighthouse, informe WAVE ni capturas.

Procedimiento reproducible:

1. En `hogarpro/hogarpro-fronted`, ejecutar `npm.cmd run dev -- --background` si el servidor no está activo. Usar `npm.cmd exec astro dev -- status` para consultar su estado.
2. Abrir `http://127.0.0.1:4321/demo-multimodal` en Chrome.
3. Abrir DevTools → Lighthouse, seleccionar Accessibility y ejecutar el análisis para escritorio y móvil. Guardar el informe HTML y registrar fecha, versión de Chrome, puntuación y hallazgos.
4. Repetir el análisis de `/solicitar` con sesión de cliente y el paso de revisión visible. Si Lighthouse recarga el asistente y pierde el paso, documentar esa limitación y evaluar el DOM actual con WAVE o herramientas de accesibilidad de DevTools.
5. Recorrer con Tab y Shift+Tab; cambiar casillas con Espacio y confirmar con Enter o Espacio. Verificar foco visible, procesamiento, bloqueo y éxito.
6. En la demo, reiniciar, marcar «Simular un error» y confirmar: comprobar mensaje, ausencia de señales de éxito y posibilidad de reintento. Desmarcar el error y reintentar.
7. Activar y desactivar sonido y vibración independientemente. Repetir en un móvil compatible. Abrir DevTools → Rendering y emular `prefers-reduced-motion: reduce`.
8. Probar NVDA con Chrome o VoiceOver con Safari; registrar lectura de nombre, estado y error, además del efecto de la navegación posterior al éxito.

Para el flujo real se necesita backend y MySQL activos y una cuenta de cliente. Una prueba de confirmación real crea una solicitud: utilizar datos de prueba y verificar un único registro desde el listado. No se realizó este guardado durante la verificación automatizada.

## 13. Tabla de resultados

| Criterio evaluado | Método de verificación | Resultado real | Observaciones |
| --- | --- | --- | --- |
| Compilación Astro | `npm.cmd run build` | Correcta; 12 páginas generadas | Incluye inicio, rutas existentes y demo |
| Controlador multimodal | `node --test tests/confirmation.test.cjs` | 4 pruebas aprobadas; 0 fallidas | DOM y APIs sustituidos; no prueba física |
| Inicio, formulario y demo | Solicitudes HTTP locales | HTTP 200 en `/`, `/solicitar`, `/demo-multimodal` | Disponibilidad y HTML, no interacción visual |
| Servicios existentes | GET por proxy `/api/auth/me`, `/api/categories`, `/api/professionals` | HTTP 200 y JSON esperado | Sin crear datos ni autenticar una cuenta nueva |
| 4.1.2 Nombre, función y valor | Inspección de HTML y controlador | Botón, etiquetas, estados y bloqueo presentes | Lectura asistida pendiente |
| 1.4.2 Control de audio | Inspección y prueba del controlador | Opt-in y supresión de tonos al desactivar | Audición real pendiente |
| 2.1.1 Teclado | Inspección de controles nativos | Semántica adecuada; prueba manual pendiente | Enter, Espacio y orden del foco por comprobar |
| 2.4.7 Foco visible | Inspección CSS | Contorno explícito presente | Verificación visual pendiente |
| 1.4.3 Contraste mínimo | Cálculo de luminancia sRGB de colores declarados | Blanco/verde: 7,22:1; texto principal/blanco: 11,74:1; ayuda/blanco: 7,22:1; error/blanco: 9,03:1 | Superan 4,5:1; no auditoría completa de estilos computados |
| 4.1.3 Mensajes de estado | Inspección y prueba del controlador | Texto de éxito/error y regiones vivas presentes | Anuncios con lector pendientes |
| Movimiento reducido | Inspección de media query | Reglas para eliminar movimiento presentes | Emulación en navegador pendiente |
| Error y reintento | Pruebas automatizadas | Sin señales de éxito en error; botón desbloqueado | Incluye fallo simulado de demo |
| API háptica ausente/audio fallido | Prueba con APIs sustituidas | Éxito visual conservado sin excepciones propagadas | No garantiza soporte en dispositivos reales |
| Activaciones repetidas | Pruebas e inspección del guardado | Demo emite una señal; guardia sincrónica en formulario real | Doble clic real y registro único en MySQL pendientes |
| Lighthouse / WAVE | Intento de acceso al navegador | Pendiente; sin puntuación | Host de navegador no disponible |
| Responsive y diseño existente | Inspección CSS y compilación | Estilos anteriores conservados; ancho flexible añadido | Inspección visual móvil pendiente |

## 14. Evidencias y capturas

Evidencias disponibles: archivos fuente, generación de las 12 rutas, respuestas HTTP y prueba reproducible `tests/confirmation.test.cjs`. La prueba utiliza Node 24 y su función experimental de eliminación de tipos TypeScript; su advertencia no representa un fallo.

Espacios para incorporar evidencias visuales:

- [Captura 1: paso de revisión real con controles sensoriales].
- [Captura 2: procesamiento y foco visible].
- [Captura 3: éxito de la demostración].
- [Captura 4: error y reintento].
- [Captura 5: versión móvil y navegador sin vibración].
- [Captura 6: informe Lighthouse de escritorio y móvil].
- [Registro 7: lectura NVDA/VoiceOver y prueba física de audio/vibración].

## 15. Limitaciones

No se ejecutaron Lighthouse/WAVE, navegación visual, lector de pantalla, percepción auditiva ni prueba háptica física. La compilación no sustituye una comprobación completa de tipos ni una auditoría de accesibilidad. Las pruebas del controlador no validan por sí solas la hidratación del slot de Astro en React; la integración debe recorrerse manualmente con sesión de cliente. No se registró una solicitud de prueba en MySQL.

La vibración y el audio dependen de las políticas del dispositivo. Las preferencias se aplican a la instancia actual y no se persisten entre páginas. La navegación automática posterior al éxito debe evaluarse con lectores de pantalla para comprobar que el anuncio tenga tiempo suficiente. La guardia de envío no implementa idempotencia entre pestañas o reintentos de red.

## 16. Conclusiones

Se implementó un componente Astro funcional integrado en el formulario existente, acompañado de una demostración que comparte su controlador y no guarda datos. Las comprobaciones realizadas confirman compilación, disponibilidad HTTP y comportamiento lógico de las señales, incluidos error, reintento y ausencia de APIs opcionales. La evaluación final de conformidad requiere completar la auditoría instrumental y las pruebas humanas identificadas en este documento.
