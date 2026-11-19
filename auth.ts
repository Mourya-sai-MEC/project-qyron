import {createHash,createHmac,timingSafeEqual} from "crypto";
const secret=()=>process.env.SESSION_SECRET||process.env.ADMIN_PASSWORD||"";
const sig=(s:string)=>createHmac("sha256",secret()).update(s).digest("hex");
export const authReady=()=>!!process.env.ADMIN_PASSWORD&&!!process.env.SUPABASE_SERVICE_ROLE_KEY&&!!process.env.NEXT_PUBLIC_SUPABASE_URL;
export function passOk(p:string){const h=(s:string)=>createHash("sha256").update(s).digest();return timingSafeEqual(h(p),h(process.env.ADMIN_PASSWORD||""))}
export const makeToken=()=>{const e=String(Date.now()+7*864e5);return e+"."+sig(e)};
export function authed(req:Request){
  const m=(req.headers.get("cookie")||"").match(/(?:^|; )qy_admin=([^;]+)/);
  if(!m||!authReady())return false;
  const[e,s]=m[1].split(".");if(!e||!s||+e<Date.now())return false;
  const x=Buffer.from(sig(e)),y=Buffer.from(s);return x.length===y.length&&timingSafeEqual(x,y);
}
const hits=new Map<string,{n:number;t:number}>();
/** best-effort per-instance rate limit */
export function limited(key:string,max:number,windowMs:number){
  const now=Date.now(),h=hits.get(key);
  if(!h||now-h.t>windowMs){hits.set(key,{n:1,t:now});return false}
  h.n++;return h.n>max;
}
export const ipOf=(r:Request)=>(r.headers.get("x-forwarded-for")||"local").split(",")[0].trim();
