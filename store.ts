import {createClient,SupabaseClient} from "@supabase/supabase-js";
import type {Img,Msg,Project} from "../projects";
type Row=Record<string,unknown>;
let c:SupabaseClient|null=null;
export const sb=()=>(c??=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}}));
export const BUCKET="projects";
const toP=(r:Row):Project=>({id:r.id as string,title:r.title as string,description:(r.description as string)||"",category:r.category as string,tags:(r.tags as string[])||[],date:(r.date as string)||"",featured:!!r.featured,status:r.status as Project["status"],order:Number(r.sort_order),cover:(r.cover as Img|null)||null,images:(r.images as Img[])||[]});
const toRow=(p:Project)=>({id:p.id,title:p.title,description:p.description,category:p.category,tags:p.tags,date:p.date,featured:p.featured,status:p.status,sort_order:p.order,cover:p.cover,images:p.images,updated_at:new Date().toISOString()});
const paths=(l:Project[])=>l.flatMap(p=>[p.cover?.path,...p.images.map(i=>i.path)]).filter((x):x is string=>!!x);
export async function getProjects(onlyPublished=false):Promise<Project[]>{
  let q=sb().from("projects").select("*").order("sort_order",{ascending:true});
  if(onlyPublished)q=q.eq("status","published");
  const{data,error}=await q;if(error)throw error;return(data as Row[]).map(toP);
}
export async function saveProjects(next:Project[]){
  const old=await getProjects();
  if(next.length){const{error}=await sb().from("projects").upsert(next.map(toRow));if(error)throw error}
  const ids=new Set(next.map(p=>p.id)),dead=old.filter(p=>!ids.has(p.id)).map(p=>p.id);
  if(dead.length){const{error}=await sb().from("projects").delete().in("id",dead);if(error)throw error}
  const keep=new Set(paths(next)),gone=paths(old).filter(x=>!keep.has(x));
  if(gone.length)await sb().storage.from(BUCKET).remove(gone);
}
export async function addMessage(m:Omit<Msg,"id"|"at">){const{error}=await sb().from("messages").insert(m);if(error)throw error}
export async function listMessages():Promise<Msg[]>{
  const{data,error}=await sb().from("messages").select("*").order("created_at",{ascending:false}).limit(300);
  if(error)throw error;return(data as Row[]).map(r=>({id:r.id as string,name:r.name as string,email:r.email as string,type:r.type as string,message:r.message as string,at:(r.created_at as string)||null}));
}
