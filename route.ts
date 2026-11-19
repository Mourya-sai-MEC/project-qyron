import {NextResponse} from "next/server";
import {getProjects} from "@/lib/server/store";
export const dynamic="force-dynamic";
export async function GET(){
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.NEXT_PUBLIC_SUPABASE_URL)return NextResponse.json({error:"not configured"},{status:503});
  try{
    const l=await getProjects(true);
    return NextResponse.json(l,{headers:{"Cache-Control":"public, s-maxage=10, stale-while-revalidate=60"}});
  }catch{return NextResponse.json({error:"unavailable"},{status:500})}
}
