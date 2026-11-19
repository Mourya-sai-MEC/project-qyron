"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {Project,fetchPublished,sendMessage} from "@/lib/projects";
import {CATS,CONTACT_EMAIL,SAMPLE,SERVICES,SOCIALS,STEPS} from "@/lib/data";
import Art from "./Art";

const RM="(prefers-reduced-motion:reduce)";
const Chars=({t}:{t:string})=><>{[...t].map((c,i)=><span key={i} className="ch">{c===" "?"\u00a0":c}</span>)}</>;
const Thumb=({p,i}:{p:Project;i:number})=>p.cover
  ?/* eslint-disable-next-line @next/next/no-img-element */<img src={p.cover.url} alt={p.title} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
  :<Art i={i}/>;

export default function Site(){
  const root=useRef<HTMLDivElement>(null);
  const [projects,setProjects]=useState<Project[]>(SAMPLE);
  const [loaded,setLoaded]=useState(false),[minDone,setMinDone]=useState(false),[gone,setGone]=useState(false);
  const [filter,setFilter]=useState("All"),[menu,setMenu]=useState(false),[open,setOpen]=useState<number|null>(null);
  const [note,setNote]=useState({t:"",err:false}),[sending,setSending]=useState(false);
  const last=useRef(0),firstFilter=useRef(true);
  const ready=loaded&&minDone;

  useEffect(()=>{fetchPublished().then(p=>{if(p)setProjects(p)}).finally(()=>setLoaded(true))},[]);
  useEffect(()=>{
    const rm=matchMedia(RM).matches;
    const t=gsap.to("#loader .bar b",{width:"100%",duration:rm?0:1.4,ease:"power2.inOut",onComplete:()=>setMinDone(true)});
    if(!rm)gsap.from("#loader img",{scale:.85,opacity:0,duration:.8,ease:"power3.out"});
    return()=>{t.kill()};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const rm=matchMedia(RM).matches;
    gsap.to("#loader",{yPercent:-100,duration:rm?0:.9,ease:"power4.inOut",onComplete:()=>setGone(true)});
  },[ready]);

  /* main animation system */
  useEffect(()=>{
    if(!ready)return;
    gsap.registerPlugin(ScrollTrigger);
    const rm=matchMedia(RM).matches;
    const ctx=gsap.context(()=>{
      gsap.to("#prog",{scaleX:1,ease:"none",scrollTrigger:{start:0,end:"max",scrub:.2}});
      ScrollTrigger.create({start:600,onToggle:s=>gsap.to("#top",{opacity:s.isActive?1:0,pointerEvents:s.isActive?"auto":"none",duration:.3})});
      if(rm)return;
      gsap.set(".hero .l",{overflow:"hidden",paddingBottom:".06em"});
      gsap.from(".hero .ch",{yPercent:110,rotate:6,stagger:.018,duration:1,ease:"power4.out"});
      gsap.from(".pic",{clipPath:"inset(0 100% 0 0)",duration:1.1,delay:.5,ease:"power3.inOut",stagger:.15});
      const sq=document.getElementById("sq") as unknown as SVGPathElement,L=sq.getTotalLength();
      gsap.fromTo(sq,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.2,delay:1,ease:"power2.out"});
      gsap.from(".hero .sub",{opacity:0,y:20,delay:1,duration:.8});
      gsap.utils.toArray<HTMLElement>(".rv").forEach(e=>gsap.from(e,{y:60,opacity:0,duration:1,ease:"power3.out",scrollTrigger:{trigger:e,start:"top 88%"}}));
      gsap.utils.toArray<HTMLElement>("[data-n]").forEach(e=>{const o={v:0};gsap.to(o,{v:+(e.dataset.n||0),duration:1.4,ease:"power2.out",scrollTrigger:{trigger:e,start:"top 90%"},onUpdate:()=>{e.textContent=String(Math.round(o.v))}})});
      gsap.to(".pic",{yPercent:-30,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
      gsap.utils.toArray<HTMLElement>(".step").forEach((s,i)=>gsap.from(s,{y:50,opacity:0,delay:i*.08,scrollTrigger:{trigger:"#steps",start:"top 85%"}}));
      gsap.utils.toArray<HTMLElement>(".svc").forEach(s=>gsap.from(s,{opacity:0,y:40,scrollTrigger:{trigger:s,start:"top 92%"}}));
      const r=document.getElementById("rail");
      if(r)gsap.matchMedia().add("(min-width:900px)",()=>{
        const w=()=>r.scrollWidth-innerWidth;
        gsap.to(r,{x:()=>-w(),ease:"none",scrollTrigger:{trigger:"#railw",start:"center center",end:()=>"+="+w(),pin:true,scrub:true,invalidateOnRefresh:true}});
      });
    },root);
    return()=>ctx.revert();
  },[ready]);

  /* gallery restagger on filter change */
  useEffect(()=>{
    if(firstFilter.current){firstFilter.current=false;return}
    if(matchMedia(RM).matches)return;
    const t=gsap.from(".gal .card",{y:50,opacity:0,stagger:.07,duration:.6,ease:"power3.out",clearProps:"all"});
    ScrollTrigger.refresh();
    return()=>{t.kill()};
  },[filter]);

  /* menu overlay */
  useEffect(()=>{
    const m=document.getElementById("menu")!,rm=matchMedia(RM).matches;
    if(menu){m.style.visibility="visible";gsap.to(m,{clipPath:"inset(0 0 0% 0)",duration:rm?0:.7,ease:"power4.inOut"});gsap.fromTo("#menu a",{y:80,opacity:0},{y:0,opacity:1,stagger:.06,delay:.2,duration:rm?0:.6})}
    else gsap.to(m,{clipPath:"inset(0 0 100% 0)",duration:rm?0:.6,ease:"power4.inOut",onComplete:()=>{m.style.visibility="hidden"}});
  },[menu]);

  /* project page overlay */
  useEffect(()=>{
    const el=document.getElementById("proj")!,rm=matchMedia(RM).matches;
    if(open!==null){el.style.visibility="visible";el.scrollTop=0;document.body.style.overflow="hidden";gsap.fromTo(el,{y:"100%"},{y:0,duration:rm?0:.7,ease:"power4.out"})}
    else gsap.to(el,{y:"100%",duration:rm?0:.5,ease:"power3.in",onComplete:()=>{el.style.visibility="hidden";document.body.style.overflow=""}});
  },[open]);
  useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(null);setMenu(false)}};addEventListener("keydown",k);return()=>removeEventListener("keydown",k)},[]);

  const go=(id:string)=>{setMenu(false);setTimeout(()=>scrollTo({top:document.getElementById(id)!.offsetTop,behavior:matchMedia(RM).matches?"auto":"smooth"}),matchMedia(RM).matches?0:450)};
  const list=filter==="All"?projects:projects.filter(p=>p.category===filter);
  const featured=projects.filter(p=>p.featured);
  if(open!==null)last.current=open;
  const cur=projects[last.current]||projects[0];
  const Card=({p}:{p:Project})=>{const i=projects.indexOf(p);return(
    <button className="card" style={{width:"100%"}} onClick={()=>setOpen(i)}><div className="thumb"><Thumb p={p} i={i}/></div><div className="meta"><h3>{p.title}</h3><span className="mono">{p.category}</span></div></button>)};

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const form=e.currentTarget,f=new FormData(form);
    const name=String(f.get("name")||"").trim(),email=String(f.get("email")||"").trim(),type=String(f.get("type")||""),message=String(f.get("msg")||"").trim();
    if(!name||!/^\S+@\S+\.\S+$/.test(email)||!message){setNote({t:"Please complete name, a valid email and message.",err:true});return}
    setSending(true);
    try{await sendMessage({name,email,type,message});form.reset();setNote({t:"Thank you. Your message has been sent.",err:false})}
    catch{setNote({t:"Could not send right now. Please email "+CONTACT_EMAIL,err:true})}
    setSending(false);
  }

  return(<div ref={root}>
    {!gone&&<div id="loader"><img src="/logo.jpg" alt="QYRON STUDIO"/><div className="bar"><b/></div></div>}
    <div id="prog"/>
    <div className="grid-lines" aria-hidden="true">{[...Array(7)].map((_,i)=><i key={i}/>)}</div>
    <header><a href="#home" className="brand">QYRON</a><span className="mono status">Available for new projects</span><button className="mono menu-btn" aria-expanded={menu} onClick={()=>setMenu(true)}>Menu</button></header>
    <nav id="menu" aria-label="Main"><button className="mono" onClick={()=>setMenu(false)}>Close ✕</button>
      {[["about","About"],["work","Portfolio"],["services","Services"],["process","Process"],["contact","Contact"]].map(([id,l])=><a key={id} href={"#"+id} onClick={e=>{e.preventDefault();go(id)}}>{l}</a>)}</nav>

    <main>
      <section className="hero" id="home">
        <h1><span className="l"><Chars t="Ideas "/><span className="pic"><Art i={2}/></span></span>
          <span className="l"><span className="pic"><Art i={4}/></span><Chars t="into visuals."/></span>
          <span className="l"><Chars t="Visuals into"/></span><span className="l"><Chars t="impact."/></span></h1>
        <svg className="squig" viewBox="0 0 520 18" fill="none" stroke="#F54900" strokeWidth="3" strokeLinecap="round"><path id="sq" d="M4 12 C80 2,140 16,220 8 S400 4,516 10"/></svg>
        <p className="sub">Independent creative design studio. Brands, posters, posts and experiments, built with obsessive care for detail.</p>
        <div className="scroll mono"><b/>Scroll</div>
      </section>

      <section className="about" id="about">
        <div className="label mono" style={{gridColumn:"1/-1"}}><span>01 / About</span><span>Qyron Studio</span></div>
        <h2 className="rv">An independent studio turning <em>ideas</em> into visuals people remember.</h2>
        <p className="rv">QYRON STUDIO is a small creative practice working across identity, print, social and automotive visuals. No templates, no noise: just clear thinking, bold type and craft you can feel.</p>
        <div className="stats">{[["9","Disciplines"],["5","Stage process"],["1","Standard: distinctive"]].map(([n,l])=><div key={l}><b data-n={n}>0</b><span className="mono">{l}</span></div>)}</div>
      </section>

      <section id="work">
        <div className="label mono"><span>02 / Portfolio</span><span>{list.length} projects</span></div>
        <div className="big rv">Selected<br/>work.</div>
        {featured.length>0&&<div className="rail-wrap" id="railw" style={{marginTop:"8vh"}}><div className="rail" id="rail">{featured.map(p=><div className="card-w" key={p.id} style={{width:"min(68vw,560px)"}}><Card p={p}/></div>)}</div></div>}
        <div className="filters mono" style={{marginTop:"12vh"}}>{["All",...CATS].map(c=><button key={c} className={"chip"+(filter===c?" on":"")} onClick={()=>setFilter(c)}>{c}</button>)}</div>
        <div className="gallery gal">{list.map(p=><Card key={p.id} p={p}/>)}</div>
        {list.length===0&&<p className="mono">New work coming soon.</p>}
      </section>

      <section id="services"><div className="label mono"><span>03 / Services</span><span>What we do</span></div>
        {SERVICES.map((s,i)=><div className="svc" key={s[0]}><span className="mono">0{i+1}</span><span className="t">{s[0]}</span><em>{s[1]}</em></div>)}</section>

      <section className="proc" id="process"><div className="label mono"><span>04 / Creative process</span><span>Five stages</span></div>
        <div className="big rv" style={{marginBottom:"8vh"}}>How it<br/>gets made.</div>
        <div className="steps" id="steps">{STEPS.map((s,i)=><div className="step" key={s[0]}><b>0{i+1}</b><h4>{s[0]}</h4><p>{s[1]}</p></div>)}</div></section>

      <section id="contact"><div className="label mono"><span>05 / Contact</span><span>{CONTACT_EMAIL}</span></div>
        <div className="big rv">Let&apos;s create something distinctive.</div>
        <form onSubmit={submit} noValidate>
          <label><span className="mono">Name</span><input name="name" required autoComplete="name" maxLength={120}/></label>
          <label><span className="mono">Email</span><input name="email" type="email" required autoComplete="email" maxLength={200}/></label>
          <label className="full"><span className="mono">Project type</span><select name="type">{["Branding","Logo Design","Poster","Social Media","T-shirt Design","Automotive","Other"].map(o=><option key={o}>{o}</option>)}</select></label>
          <label className="full"><span className="mono">Message</span><textarea name="msg" required maxLength={4000}/></label>
          <div className="full"><button className="btn" type="submit" disabled={sending}>{sending?"Sending…":"Send message"} <span>→</span></button>
            <p id="note" className="mono" role="status" style={{color:note.err?"#F54900":undefined}}>{note.t}</p></div>
        </form></section>
    </main>
    <footer className="mono"><span>© {new Date().getFullYear()} QYRON STUDIO</span><span>{SOCIALS.map(s=><a key={s[0]} href={s[1]} rel="noopener noreferrer" style={{marginLeft:18}}>{s[0]}</a>)}</span></footer>
    <button id="top" aria-label="Back to top" onClick={()=>scrollTo({top:0,behavior:matchMedia(RM).matches?"auto":"smooth"})}>↑</button>

    <div id="proj" role="dialog" aria-modal="true"><button className="close mono" onClick={()=>setOpen(null)}>Close ✕</button>
      {cur&&<div><div className="hd"><div><p className="mono">{cur.category} / {cur.date}</p><h2 className="big" style={{marginTop:12}}>{cur.title}</h2></div>
        <div><p style={{fontSize:18,lineHeight:1.35,whiteSpace:"pre-line"}}>{cur.description}</p>{cur.tags.map(t=><span key={t} className="tag mono">{t}</span>)}</div></div>
        <div className="imgs">{(cur.images.length?cur.images:cur.cover?[cur.cover]:[]).length?(cur.images.length?cur.images:[cur.cover!]).map((im,j)=>/* eslint-disable-next-line @next/next/no-img-element */<img key={j} src={im.url} alt={`${cur.title} ${j+1}`} loading="lazy" style={{width:"100%",height:"auto"}}/>)
          :[0,1,2].map(j=><div className="thumb" key={j}><Art i={last.current+j}/></div>)}</div></div>}
    </div>
  </div>);
}
