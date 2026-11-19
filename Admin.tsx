"use client";
import {FormEvent,useCallback,useEffect,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {createClient} from "@supabase/supabase-js";
import {Img,Msg,Project,byOrder,fetchAll,fetchMessages,saveAll} from "@/lib/projects";
import {CATS} from "@/lib/data";

let browser:ReturnType<typeof createClient>|null=null;
const sbc=()=>(browser??=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));
const Field=({l,children}:{l:string;children:React.ReactNode})=><label><span className="mono">{l}</span>{children}</label>;

function Editor({p,onSave,onClose}:{p:Project|null;onSave:(x:Project)=>Promise<void>;onClose:()=>void}){
  const [t,setT]=useState(p?.title||""),[d,setD]=useState(p?.description||""),[c,setC]=useState(p?.category||CATS[0]);
  const [tags,setTags]=useState(p?.tags.join(", ")||""),[date,setDate]=useState(p?.date||new Date().toISOString().slice(0,10)),[feat,setFeat]=useState(p?.featured||false);
  const [cover,setCover]=useState<File|null>(null),[keepCover]=useState<Img|null>(p?.cover||null);
  const [imgs,setImgs]=useState<File[]>([]),[keep,setKeep]=useState<Img[]>(p?.images||[]);
  const [busy,setBusy]=useState(""),[err,setErr]=useState("");

  async function save(status:"draft"|"published"){
    setErr("");
    if(!t.trim()){setErr("Title is required.");return}
    if(status==="published"&&!cover&&!keepCover){setErr("Add a cover image before publishing.");return}
    setBusy(status);
    const id=p?.id||crypto.randomUUID();
    const up=async(f:File):Promise<Img>=>{
      const r=await fetch("/api/admin/upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:id,name:f.name})});
      const k=await r.json();if(!r.ok)throw new Error(k.error||"Upload failed");
      const{error}=await sbc().storage.from("projects").uploadToSignedUrl(k.path,k.token,f,{contentType:f.type});
      if(error)throw new Error(error.message);return{url:k.url,path:k.path};
    };
    try{
      const coverImg=cover?await up(cover):keepCover;
      const added=await Promise.all(imgs.map(up));
      await onSave({id,title:t.trim(),description:d.trim(),category:c,tags:tags.split(",").map(x=>x.trim()).filter(Boolean),date,featured:feat,status,order:p?.order??-Date.now(),cover:coverImg,images:[...keep,...added]});
      onClose();
    }catch(e){setErr("Save failed: "+(e as Error).message);setBusy("")}
  }
  const thumb="h-20 w-28 object-cover border border-ink";
  return(<motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:30}} className="fixed inset-0 z-[80] overflow-y-auto bg-paper">
    <div className="adm"><div className="flex justify-between mono"><span>{p?"Edit project":"New project"}</span><button onClick={onClose}>Close ✕</button></div>
      <div className="mt-8 grid gap-7 md:grid-cols-2">
        <div className="md:col-span-2"><Field l="Title"><input value={t} onChange={e=>setT(e.target.value)} maxLength={120}/></Field></div>
        <div className="md:col-span-2"><Field l="Description"><textarea value={d} onChange={e=>setD(e.target.value)} rows={5}/></Field></div>
        <Field l="Category"><select value={c} onChange={e=>setC(e.target.value)}>{CATS.map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field l="Project date"><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field>
        <Field l="Tags (comma separated)"><input value={tags} onChange={e=>setTags(e.target.value)}/></Field>
        <label className="flex items-center gap-3 self-end"><input type="checkbox" className="!w-5" checked={feat} onChange={e=>setFeat(e.target.checked)}/><span className="mono">Featured in homepage rail</span></label>

        <div className="md:col-span-2"><span className="mono">Cover image {keepCover&&!cover&&"(pick a file to replace)"}</span>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {(cover||keepCover)&&/* eslint-disable-next-line @next/next/no-img-element */<img className={thumb} alt="cover" src={cover?URL.createObjectURL(cover):keepCover!.url}/>}
            <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)}/></div></div>

        <div className="md:col-span-2"><span className="mono">Project images</span>
          <div className="mt-3 flex flex-wrap gap-3">
            {keep.map(i=><div key={i.url} className="relative">{/* eslint-disable-next-line @next/next/no-img-element */}<img className={thumb} alt="" src={i.url}/>
              <button className="absolute right-0 top-0 bg-ink px-2 text-paper" aria-label="Remove image" onClick={()=>setKeep(keep.filter(k=>k!==i))}>✕</button></div>)}
            {imgs.map((f,j)=><div key={j} className="relative">{/* eslint-disable-next-line @next/next/no-img-element */}<img className={thumb} alt="" src={URL.createObjectURL(f)}/>
              <button className="absolute right-0 top-0 bg-orange px-2 text-paper" aria-label="Remove image" onClick={()=>setImgs(imgs.filter((_,k)=>k!==j))}>✕</button></div>)}</div>
          <input className="mt-3" type="file" accept="image/*" multiple onChange={e=>{setImgs([...imgs,...Array.from(e.target.files||[])]);e.target.value=""}}/></div>
      </div>
      {err&&<p className="mono mt-6 text-orange" role="alert">{err}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        <button className="btn" disabled={!!busy} onClick={()=>save("published")}>{busy==="published"?"Publishing…":"Publish"}</button>
        <button className="ghost mono" disabled={!!busy} onClick={()=>save("draft")}>{busy==="draft"?"Saving…":"Save draft"}</button></div>
    </div></motion.div>);
}

export default function Admin(){
  const [state,setState]=useState<"loading"|"setup"|"login"|"in">("loading"),[pass,setPass]=useState(""),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
  const [list,setList]=useState<Project[]>([]),[msgs,setMsgs]=useState<Msg[]>([]),[tab,setTab]=useState<"projects"|"inbox">("projects");
  const [edit,setEdit]=useState<Project|null|undefined>(undefined);

  useEffect(()=>{fetch("/api/admin/auth",{cache:"no-store"}).then(r=>r.json()).then(s=>setState(!s.configured?"setup":s.authed?"in":"login")).catch(()=>setState("setup"))},[]);
  const load=useCallback(()=>Promise.all([fetchAll(),fetchMessages()]).then(([a,b])=>{setList(a);setMsgs(b)}),[]);
  useEffect(()=>{if(state==="in")load().catch(e=>setErr(e.message))},[state,load]);

  async function login(e:FormEvent){
    e.preventDefault();setErr("");setBusy(true);
    const r=await fetch("/api/admin/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({passcode:pass})}).catch(()=>null);
    setPass("");setBusy(false);
    if(r?.ok)setState("in");else setErr(r?.status===429?"Too many attempts. Try again in a few minutes.":"Incorrect passcode.");
  }
  const logout=async()=>{await fetch("/api/admin/auth",{method:"DELETE"});setState("login")};
  const mutate=async(fn:(l:Project[])=>Project[])=>{setErr("");const prev=list,next=fn(list);setList(next);try{await saveAll(next)}catch(e){setList(prev);setErr((e as Error).message)}};
  const upsert=async(x:Project)=>{const next=(list.some(a=>a.id===x.id)?list.map(a=>a.id===x.id?x:a):[...list,x]).sort(byOrder);await saveAll(next);setList(next)};
  const move=(i:number,dir:number)=>mutate(l=>{const n=[...l],a=l[i],b=l[i+dir];n[i]={...a,order:b.order};n[i+dir]={...b,order:a.order};return n.sort(byOrder)});
  const patch=(p:Project,x:Partial<Project>)=>mutate(l=>l.map(a=>a.id===p.id?{...a,...x}:a));

  if(state==="loading")return<div className="adm mono">Loading…</div>;
  if(state==="setup")return<div className="adm"><h1 className="big" style={{fontSize:"clamp(32px,7vw,90px)"}}>Setup needed</h1><p className="mt-6 max-w-xl">Add the Supabase keys and <code>ADMIN_PASSWORD</code> to your environment variables (see <code>.env.local.example</code>), then redeploy. See README.md.</p></div>;
  if(state==="login")return(<div className="adm" style={{minHeight:"100svh",display:"grid",placeItems:"center"}}>
    <form onSubmit={login} style={{display:"block",maxWidth:420,width:"100%"}}>
      <p className="mono">QYRON STUDIO / Admin</p><h1 className="big mt-3" style={{fontSize:"clamp(40px,10vw,90px)"}}>Passcode</h1>
      <input className="mt-8" type="password" value={pass} onChange={e=>setPass(e.target.value)} autoComplete="current-password" aria-label="Passcode" autoFocus required/>
      {err&&<p className="mono mt-4 text-orange" role="alert">{err}</p>}
      <button className="btn mt-8" disabled={busy}>{busy?"Checking…":"Enter"}</button></form></div>);

  return(<div className="adm">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink pb-4"><span style={{fontWeight:800,fontSize:22}}>QYRON / Admin</span>
      <div className="flex gap-3 mono"><a className="ghost" href="/">View site</a><button className="ghost" onClick={logout}>Sign out</button></div></div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-2 mono">{(["projects","inbox"] as const).map(x=><button key={x} className={"chip"+(tab===x?" on":"")} onClick={()=>setTab(x)}>{x==="inbox"?`Inbox (${msgs.length})`:`Projects (${list.length})`}</button>)}</div>
      {tab==="projects"&&<button className="btn" onClick={()=>setEdit(null)}>+ New project</button>}</div>
    {err&&<p className="mono mt-4 text-orange" role="alert">{err}</p>}

    {tab==="projects"&&<ul className="mt-8">
      <AnimatePresence>{list.map((p,i)=><motion.li layout key={p.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-wrap items-center gap-4 border-b border-ink py-4">
        <div className="h-16 w-24 shrink-0 bg-ink">{/* eslint-disable-next-line @next/next/no-img-element */}{p.cover&&<img src={p.cover.url} alt="" className="h-full w-full object-cover"/>}</div>
        <div className="min-w-[160px] flex-1"><div style={{fontWeight:700,fontSize:18}}>{p.title}</div><div className="mono">{p.category} · <span style={{color:p.status==="published"?"#F54900":undefined}}>{p.status}</span>{p.featured&&" · featured"}</div></div>
        <div className="flex flex-wrap gap-2 mono">
          <button className="ghost" disabled={i===0} aria-label="Move up" onClick={()=>move(i,-1)}>↑</button>
          <button className="ghost" disabled={i===list.length-1} aria-label="Move down" onClick={()=>move(i,1)}>↓</button>
          <button className="ghost" onClick={()=>setEdit(p)}>Edit</button>
          <button className="ghost" onClick={()=>patch(p,{featured:!p.featured})}>{p.featured?"Unfeature":"Feature"}</button>
          <button className="ghost" onClick={()=>patch(p,{status:p.status==="published"?"draft":"published"})}>{p.status==="published"?"Unpublish":"Publish"}</button>
          <button className="ghost" onClick={()=>{if(confirm(`Delete "${p.title}" and its images?`))mutate(l=>l.filter(a=>a.id!==p.id))}}>Delete</button></div>
      </motion.li>)}</AnimatePresence>
      {list.length===0&&<p className="mono mt-6">No projects yet. Add your first one.</p>}</ul>}

    {tab==="inbox"&&<ul className="mt-8">{msgs.map(m=><li key={m.id} className="border-b border-ink py-5"><div className="mono">{m.at?new Date(m.at).toLocaleString():""} · {m.type}</div>
      <div style={{fontWeight:700,fontSize:18}} className="mt-1">{m.name} <a href={`mailto:${m.email}`} style={{color:"#F54900",fontWeight:400,fontSize:14}}>{m.email}</a></div>
      <p className="mt-2 max-w-2xl" style={{whiteSpace:"pre-wrap"}}>{m.message}</p></li>)}{msgs.length===0&&<p className="mono">No messages yet.</p>}</ul>}

    <AnimatePresence>{edit!==undefined&&<Editor key={edit?.id||"new"} p={edit} onSave={upsert} onClose={()=>setEdit(undefined)}/>}</AnimatePresence>
  </div>);
}
