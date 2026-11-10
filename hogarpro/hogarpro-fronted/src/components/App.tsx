import { useEffect, useState, type ReactNode } from 'react';
import { api, type User } from '../lib/api';
import { useResource } from '../lib/hooks';
import { Button, Empty, ErrorBox, Icon, Skeleton, Avatar } from './UI';
import { Auth } from './Auth';
import { Catalog, Home, HowItWorks, ProfessionalProfile } from './Catalog';
import { ProfessionalPanel, RequestDetail, RequestList, RequestWizard } from './Requests';
import { Profile } from './Profile';

export default function App({initialPath,children}:{initialPath:string;children?:ReactNode}) {
 const path=initialPath.replace(/\/$/,'')||'/';const session=useResource<{user:User|null}>('/auth/me');const [user,setUser]=useState<User|null>(null),[menu,setMenu]=useState(false),[loggingOut,setLoggingOut]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(session.data)setUser(session.data.user);},[session.data]);
 async function logout(){setLoggingOut(true);setError('');try{await api('/auth/logout',{method:'POST'});window.location.assign('/ingresar');}catch(e){setError((e as Error).message);setLoggingOut(false);}}
 const home=user?.role==='professional'?'/panel-profesional':'/';const privatePage=['/solicitar','/mis-solicitudes','/solicitud','/panel-profesional','/perfil'].includes(path);
 const next=typeof window==='undefined'?path:path+window.location.search;
 function content(){
  if(privatePage&&session.loading)return <Skeleton/>;
  if(privatePage&&session.error)return <ErrorBox message={session.error.message} retry={session.retry}/>;
  if(privatePage&&!user)return <Empty title="Inicia sesión para continuar" href={'/ingresar?next='+encodeURIComponent(next)} label="Ingresar a mi cuenta">Así podrás guardar tus solicitudes y consultar su estado desde cualquier momento.</Empty>;
  switch(path){
   case '/':return user?.role==='professional'?<ProfessionalPanel user={user} onAvailability={a=>setUser(u=>u?{...u,available:a}:u)}/>:<Home user={user}/>;
   case '/ingresar':return <Auth/>;
   case '/registro':return <Auth register/>;
   case '/servicios':return <Catalog/>;
   case '/profesional':return <ProfessionalProfile user={user}/>;
   case '/solicitar':return <RequestWizard user={user!}>{children}</RequestWizard>;
   case '/mis-solicitudes':return <RequestList user={user!}/>;
   case '/solicitud':return <RequestDetail user={user!}/>;
   case '/perfil':return <Profile user={user!}/>;
   case '/panel-profesional':return user?.role==='professional'?<ProfessionalPanel user={user} onAvailability={a=>setUser(u=>u?{...u,available:a}:u)}/>:<Empty title="Este panel es para profesionales" href="/" label="Ir a mi inicio">Desde tu cuenta de cliente puedes buscar profesionales y crear solicitudes.</Empty>;
   case '/como-funciona':return <HowItWorks/>;
   default:return <Empty title="Esta página no está disponible" href="/" label="Volver al inicio">Puedes continuar desde el inicio de HogarPro.</Empty>;
  }
 }
 return <><header className="site-header container"><nav className="nav" aria-label="Navegación principal"><a href={home} className="logo">HogarPro</a><button type="button" className="menu-toggle" aria-expanded={menu} aria-controls="navigation-links" onClick={()=>setMenu(!menu)}>{menu?'Cerrar':'Menú'}</button><div id="navigation-links" className={`nav-links ${menu?'open':''}`}><a className={path===home?'active':''} href={home}><Icon name="home"/>Inicio</a><a className={path==='/servicios'?'active':''} href="/servicios">{user?.role==='professional'?'Catálogo':'Servicios'}</a>{!user&&<a href="/como-funciona">Cómo funciona</a>}<a className={path==='/mis-solicitudes'?'active':''} href="/mis-solicitudes"><Icon name="requests"/>{user?.role==='professional'?'Solicitudes':'Mis solicitudes'}</a>{user&&<a className={path==='/perfil'?'active':''} href="/perfil"><Icon name="user"/>Mi perfil</a>}</div><div className="nav-actions">{session.loading?<span className="nav-loading" aria-label="Comprobando sesión">···</span>:user?<details className="nav-user"><summary aria-label="Abrir menú de cuenta"><Avatar name={user.name}/><span>{user.name.split(' ')[0]}</span></summary><div className="user-menu"><strong>{user.name}</strong><p>{user.role==='client'?'Cuenta de cliente':'Cuenta profesional'}</p><a href="/perfil">Mis datos personales</a><button type="button" disabled={loggingOut} onClick={logout}>{loggingOut?'Saliendo…':'Cerrar sesión'}</button></div></details>:<><a className="btn btn-outline" href="/ingresar">Ingresar</a><a className="btn btn-primary" href="/registro">Registrarse</a></>}</div></nav></header><main id="contenido" className={`container page ${path==='/'&&user?.role!=='professional'?'home-page':''}`}>{error&&<ErrorBox message={error}/>} {content()}</main><footer className="container site-footer"><span>HogarPro · Servicios profesionales a domicilio</span><span>Proyecto académico · Datos de demostración · Tamburco, Abancay</span></footer></>;
}
