import type {Project} from "./projects";
export const CONTACT_EMAIL="hello@qyron.studio";
export const SOCIALS:[string,string][]=[["Instagram","#"],["Behance","#"],["LinkedIn","#"]];
export const CATS=["Graphic Design","Branding","Logo Design","Posters","Social Media","T-shirt Designs","Photo Manipulation","Automotive Designs","Creative Experiments"];
export const SERVICES=[["Brand Identity","Marks, systems, guidelines"],["Logo Design","Distinctive, scalable marks"],["Poster & Print","Type-led, high impact"],["Social Media","Feeds with a point of view"],["Apparel Graphics","T-shirts and merch"],["Photo Manipulation","Surreal, polished composites"],["Automotive Visuals","Liveries and concepts"]];
export const STEPS=[["Discover","We listen, research and define the real problem."],["Explore","Moodboards, sketches and bold directions."],["Create","The chosen idea is built with precision."],["Refine","Details, feedback and polish until it clicks."],["Deliver","Final files, guidelines and launch support."]];
const names=["Signal Noise","Northform","Aperture Mark","Loud Paper","Daily Feed","Wear Loud","Dream Stack","Night Drive","Lab 09"];
/* shown only until Firebase is configured */
export const SAMPLE:Project[]=CATS.map((c,i)=>({id:"s"+i,title:names[i],description:"Sample project. Publish your own from /admin.",category:c,tags:["Concept"],date:"2026-0"+(i+1),featured:i<5,status:"published",order:i,cover:null,images:[]}));
