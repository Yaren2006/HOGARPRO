import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const front=path.join(root,'hogarpro-fronted');const back=path.join(root,'hogarpro-backend');
const astroPackage=path.join(front,'node_modules','astro');
const pkg=JSON.parse(readFileSync(path.join(astroPackage,'package.json'),'utf8'));
const astro=path.resolve(astroPackage,typeof pkg.bin==='string'?pkg.bin:pkg.bin.astro);
const api=spawn(process.execPath,['src/server.js'],{cwd:back,stdio:'inherit',windowsHide:true});
const web=spawn(process.execPath,[astro,'dev','--background'],{cwd:front,stdio:'inherit',windowsHide:true});
let ending=false;
function stop(code=0){if(ending)return;ending=true;api.kill();spawnSync(process.execPath,[astro,'dev','stop'],{cwd:front,stdio:'inherit',windowsHide:true});process.exitCode=code;}
web.on('exit',code=>{if(code)stop(code);else console.log('\nHogarPro: http://localhost:4321/ · Ctrl+C para detener ambos servicios.');});
api.on('exit',code=>{if(!ending)stop(code||1);});
for(const p of [api,web])p.on('error',()=>{console.error('No se pudo iniciar. Instala las dependencias de frontend y backend.');stop(1);});
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
