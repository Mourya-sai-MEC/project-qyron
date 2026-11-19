export type Img={url:string;path:string};
export type Project={id:string;title:string;description:string;category:string;tags:string[];date:string;featured:boolean;status:"draft"|"published";order:number;cover:Img|null;images:Img[]};
export type Msg={id:string;name:string;email:string;type:string;message:string;at:string|null};
const byOrder=(a:Project,b:Project)=>a.order-b.order;
const j=async(r:Response)=>{if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||r.statusText);return r.json()};
const JSONH={"Content-Type":"application/json"};
/** null = backend not configured / unreachable (site falls back to sample content) */
export async function fetchPublished():Promise<Project[]|null>{try{const r=await fetch("/api/projects",{cache:"no-store"});return r.ok?await r.json():null}catch{return null}}
export const fetchAll=():Promise<Project[]>=>fetch("/api/admin/projects",{cache:"no-store"}).then(j).then((l:Project[])=>l.sort(byOrder));
export const saveAll=(l:Project[])=>fetch("/api/admin/projects",{method:"PUT",headers:JSONH,body:JSON.stringify(l)}).then(j);
export const fetchMessages=():Promise<Msg[]>=>fetch("/api/admin/messages",{cache:"no-store"}).then(j);
export const sendMessage=(m:{name:string;email:string;type:string;message:string})=>fetch("/api/contact",{method:"POST",headers:JSONH,body:JSON.stringify(m)}).then(j);
export {byOrder};
