export interface Category { id:number; name:string; slug:string; description?:string }
export interface User { id:number; name:string; email:string; phone:string; role:'client'|'professional'; district:string; bio?:string; experience_years?:number; available?:boolean; rating?:number; review_count?:number }
export interface Professional { id:number; name:string; district:string; bio:string; experience_years:number; available:boolean; rating:number; review_count:number; categories:Category[] }
export type RequestStatus = 'pending'|'accepted'|'rejected'|'cancelled'|'completed';
export interface ServiceRequest { id:number; client_id:number; professional_id:number; category_id:number; description:string; address:string; district:string; reference:string; preferred_when:'soon'|'scheduled'; preferred_date:string|null; preferred_time:string|null; status:RequestStatus; created_at:string; category_name:string; client_name:string; professional_name:string; client_phone:string; professional_phone:string; events?:{id:number;status:RequestStatus;note:string;created_at:string;actor_name:string}[]; attachments?:{id:number;filename:string;mime_type:string}[] }
export class ApiError extends Error { status:number; fields:Record<string,string>; constructor(status:number,message:string,fields:Record<string,string>={}) {super(message);this.status=status;this.fields=fields;} }
export async function api<T>(path:string,options:{method?:string;body?:unknown;signal?:AbortSignal}={}):Promise<T> {
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 const abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});
 try { const response=await fetch('/api'+path,{method:options.method||'GET',credentials:'include',headers:options.body===undefined?{}:{'Content-Type':'application/json'},body:options.body===undefined?undefined:JSON.stringify(options.body),signal:controller.signal});
  if(response.status===204)return undefined as T;
  const data=await response.json().catch(()=>({error:'El servidor no devolvió una respuesta válida.'}));if(!response.ok)throw new ApiError(response.status,data.error||'No se pudo completar la operación.',data.fields||{});return data as T;
 } catch(e) {if(e instanceof ApiError)throw e;if(options.signal?.aborted)throw e;throw new ApiError(0,'No pudimos conectar. Comprueba que el backend y MySQL de XAMPP estén encendidos y vuelve a intentar.');}
 finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
}
export const statuses:Record<RequestStatus,string>={pending:'Pendiente de respuesta',accepted:'Aceptada',rejected:'Rechazada',cancelled:'Cancelada',completed:'Finalizada'};
export const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
export const dateTime=(s:string)=>new Date(s.replace(' ','T')+(s.includes('Z')?'':'Z')).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Lima'});
export const appointment=(r:ServiceRequest)=>r.preferred_when==='soon'?'Lo antes posible':`${r.preferred_date} · ${r.preferred_time?.slice(0,5)}`;
