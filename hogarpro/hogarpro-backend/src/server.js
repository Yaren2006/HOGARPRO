import { makePool } from './db.js';
import { createApp } from './app.js';
const pool=makePool();
try { await pool.query('SELECT 1'); } catch(e) { console.error('No se pudo conectar a la base de datos. Enciende MySQL en XAMPP, revisa .env y ejecuta npm run db:init.'); await pool.end(); process.exit(1); }
const port=Number(process.env.PORT||3001);
const server=createApp(pool).listen(port,'127.0.0.1',()=>console.log(`HogarPro API: http://localhost:${port}/api/health`));
server.on('error',e=>{console.error(`No se pudo iniciar la API (${e.code}). Comprueba si el puerto ${port} está ocupado.`);pool.end();process.exitCode=1;});
let closing=false;async function close(){if(closing)return;closing=true;server.close(async()=>{await pool.end();process.exit(0);});}
process.on('SIGINT',close);process.on('SIGTERM',close);
