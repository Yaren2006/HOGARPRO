# HogarPro

Aplicación académica con frontend **Astro 7 + React**, API **Node.js + Express** y **MariaDB/MySQL de XAMPP**. Mantiene los colores, Inter, tarjetas y navegación de HogarPro en Figma. Los datos iniciales son ejemplos para demostrar los tres flujos.

## Organización

```
hogarpro/
  hogarpro-fronted/   Astro, componentes React, estilos e íconos locales de Figma
  hogarpro-backend/   API, sesiones, validaciones y pruebas
  database/          01-schema.sql
  scripts/           Inicio coordinado
```

## Primer uso

1. Enciende **MySQL** en XAMPP. Apache puede permanecer encendido, pero la aplicación usa Node y Astro.
2. Desde esta carpeta instala las dependencias:

```powershell
npm install --prefix hogarpro-backend
npm install --prefix hogarpro-fronted
```

3. Revisa `hogarpro-backend/.env`. El archivo de ejemplo usa `127.0.0.1:3306`, usuario `root`, sin contraseña y base `hogarpro`. Si tu instalación usa una contraseña, escríbela solo en `.env`.
4. Prepara las tablas y los datos iniciales:

```powershell
npm run db:init
```

La inicialización crea la base `hogarpro` si no existe, inserta categorías y cuentas de demostración y conserva registros previos. No modifica otras bases. Puedes ver sus tablas en phpMyAdmin.

## Encender la aplicación

```powershell
cd C:\Users\Cristhian\Desktop\proyecto\hogarpro
npm run dev
```

Abre **http://localhost:4321/**. La API escucha en **http://localhost:3001/api/health**. Astro envía `/api` al backend mediante un proxy; el navegador usa una sola procedencia. El servidor Astro se inicia en modo background según las instrucciones del proyecto. Mantén abierta la terminal del comando principal y pulsa Ctrl+C para detenerlo.

También puedes usar dos terminales:

```powershell
# Terminal 1
cd hogarpro-backend
npm run dev
# Terminal 2, desde la raíz
cd hogarpro-fronted
npm run dev -- --background
```

Control de Astro: `npm run astro -- dev status`, `npm run astro -- dev logs`, `npm run astro -- dev stop` desde `hogarpro-fronted`.

## Cuentas de demostración

Contraseña compartida para estas cuentas ficticias: **HogarPro2026!**

| Cuenta | Correo | Uso |
|---|---|---|
| Lucía Huamán | cliente@hogarpro.local | Cliente |
| Carlos Quispe | carlos@hogarpro.local | Gasfitería |
| María Flores | maria@hogarpro.local | Limpieza |
| José Ramos | jose@hogarpro.local | Electricidad y soporte técnico |
| Luis Mendoza | luis@hogarpro.local | Carpintería |
| Ana Torres | ana@hogarpro.local | Electrodomésticos |

Puedes registrar cuentas nuevas de cliente o profesional. Una cuenta profesional nueva aparece en el catálogo con su especialidad y sin reseñas.

## Tres tareas para la exposición

1. **Registro y acceso.** Registra un cliente, inicia sesión, consulta Mi perfil y cierra sesión. Muestra en phpMyAdmin que la contraseña almacenada es un hash, no la contraseña escrita.
2. **Búsqueda de servicios y profesionales.** Abre Servicios, filtra Gasfitería, busca Carlos y entra a su perfil. El catálogo y los perfiles vienen de la base de datos.
3. **Crear y responder solicitudes.** Ingresa como Lucía. Abre Carlos → Solicitar servicio. Completa Problema, Domicilio y Revisión. Envía la solicitud. En otra ventana privada ingresa como Carlos, abre Solicitudes y acepta o rechaza con motivo. Actualiza la solicitud de Lucía para mostrar el cambio y su historial.

La atención aceptada puede marcarse como finalizada por el profesional. El cliente puede cancelar una solicitud pendiente o aceptada. Los dos participantes pueden consultar el historial. Las imágenes opcionales se guardan en la base de datos y se sirven únicamente a los participantes autenticados (3 imágenes, 2 MB cada una).

## Pruebas y compilación

```powershell
npm test
npm run build
```

Las pruebas de integración crean **hogarpro_test**, independiente de la base de la demostración. Verifican sesiones, roles, búsqueda, creación, permisos sobre solicitudes y archivos, cambios de estado, concurrencia, fechas y cierre de sesión. Limpian sus propios registros, sin borrar la base ni tocar `hogarpro`.

## Decisiones técnicas

- Sesiones opacas almacenadas como hash en la base; cookie HttpOnly y SameSite=Lax. No se guarda la sesión en localStorage.
- Contraseñas con bcrypt y validaciones en el backend con Zod. Consultas parametrizadas.
- El servidor comprueba quién es el cliente y el profesional de cada solicitud; ocultar un botón no es la autorización.
- Los cambios de estado se realizan dentro de transacciones y se registran en un historial.
- El frontend tiene estados de carga, vacíos, errores con reintento y resultados sin coincidencias.
- Las horas propuestas se interpretan en Perú (UTC−05:00). Los registros de auditoría se guardan en UTC y se muestran en hora peruana.
- Las reseñas y calificaciones iniciales son datos de ejemplo del prototipo. No se añadió todavía un flujo de reseñas, pagos, chat, SMS, mapas en vivo o administración.

La aplicación está preparada para la demostración local. Una publicación real requiere HTTPS, usuarios de base de datos con permisos limitados, correo/recuperación de cuenta, política de respaldos y configuración de dominio. No publiques credenciales de `.env`.

Las versiones iniciales de los archivos reemplazados se guardaron en `.respaldo-inicial/`. El frontend conserva su repositorio Git y su archivo AGENTS.md.
