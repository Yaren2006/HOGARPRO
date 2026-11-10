import { useEffect, useState } from 'react';
import { api, ApiError } from './api';
export function useResource<T>(path:string|null) {
 const [data,setData]=useState<T|null>(null),[loading,setLoading]=useState(Boolean(path)),[error,setError]=useState<ApiError|null>(null),[version,setVersion]=useState(0);
 useEffect(()=>{if(!path){setLoading(false);return;}const controller=new AbortController();setLoading(true);setError(null);api<T>(path,{signal:controller.signal}).then(value=>{if(!controller.signal.aborted)setData(value);}).catch(e=>{if(!controller.signal.aborted)setError(e);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[path,version]);
 return {data,loading,error,retry:()=>setVersion(v=>v+1)};
}
export function useQuery(){const [query,setQuery]=useState<URLSearchParams|null>(null);useEffect(()=>setQuery(new URLSearchParams(window.location.search)),[]);return query;}
