import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import { dbOptions } from '../src/db.js';
import { pathToFileURL } from 'node:url';

export async function initialize(database = process.env.DB_NAME || 'hogarpro') {
 if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('Nombre de base de datos no válido.');
 const options = dbOptions(database);
 const conn = await mysql.createConnection({ ...options, database: undefined, multipleStatements: true });
 try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.changeUser({ database });
  await conn.query(await readFile(new URL('../../database/01-schema.sql', import.meta.url), 'utf8'));
  const cats = [['Gasfitería','gasfiteria','Reparación e instalación'],['Electricidad','electricidad','Instalaciones eléctricas'],['Limpieza','limpieza','Limpieza del hogar'],['Carpintería','carpinteria','Muebles y reparaciones'],['Electrodomésticos','electrodomesticos','Reparación y soporte'],['Soporte técnico','soporte-tecnico','Equipos y computadoras']];
  for (const c of cats) await conn.execute('INSERT IGNORE INTO categories(name,slug,description) VALUES(?,?,?)',c);
  const hash = await bcrypt.hash('HogarPro2026!',12);
  const demos = [
   {name:'Lucía Huamán',email:'cliente@hogarpro.local',phone:'+51 987 654 321',role:'client'},
   {name:'Carlos Quispe',email:'carlos@hogarpro.local',phone:'+51 987 654 322',role:'professional',bio:'Técnico gasfitero. Reparación de fugas, instalación de grifería y mantenimiento de instalaciones sanitarias. Explico el trabajo antes de empezar.',experience:8,rating:4.8,reviews:32,cats:['gasfiteria']},
   {name:'María Flores',email:'maria@hogarpro.local',phone:'+51 987 654 323',role:'professional',bio:'Especialista en limpieza del hogar. Limpieza general y profunda de cocinas, baños y espacios de uso diario.',experience:6,rating:4.9,reviews:45,cats:['limpieza']},
   {name:'José Ramos',email:'jose@hogarpro.local',phone:'+51 987 654 324',role:'professional',bio:'Técnico electricista. Diagnóstico de fallas, instalaciones seguras y soporte de equipos de cómputo.',experience:7,rating:4.7,reviews:28,cats:['electricidad','soporte-tecnico']},
   {name:'Luis Mendoza',email:'luis@hogarpro.local',phone:'+51 987 654 325',role:'professional',bio:'Carpintero con experiencia en reparación de muebles, puertas y trabajos de mantenimiento para tu hogar.',experience:10,rating:4.8,reviews:19,cats:['carpinteria']},
   {name:'Ana Torres',email:'ana@hogarpro.local',phone:'+51 987 654 326',role:'professional',bio:'Revisión y reparación de electrodomésticos. Diagnóstico de lavadoras, refrigeradoras y equipos del hogar.',experience:5,rating:4.9,reviews:24,cats:['electrodomesticos']}
  ];
  for (const d of demos) {
   await conn.execute('INSERT IGNORE INTO users(name,email,phone,password_hash,role,district) VALUES(?,?,?,?,?,?)',[d.name,d.email,d.phone,hash,d.role,'Tamburco, Abancay']);
   const [[u]] = await conn.execute('SELECT id FROM users WHERE email=?',[d.email]);
   if(d.role==='professional') {
    await conn.execute('INSERT IGNORE INTO professional_profiles(user_id,bio,experience_years,rating,review_count) VALUES(?,?,?,?,?)',[u.id,d.bio,d.experience,d.rating,d.reviews]);
    for (const slug of d.cats) await conn.execute('INSERT IGNORE INTO professional_categories(professional_id,category_id) SELECT ?,id FROM categories WHERE slug=?',[u.id,slug]);
   }
  }
  console.log(`Base ${database} preparada. Los registros existentes se conservaron.`);
 } finally { await conn.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) initialize().catch(e=>{ console.error('No se pudo preparar la base:',e.message); process.exitCode=1; });
