const P=["#F5F5F4","#1C1917","#F54900"];
export default function Art({i}:{i:number}){
  const a=P[i%3],b=P[(i+1)%3],c=P[(i+2)%3],k=i%4;
  return(<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="300" fill={a}/>
    {k===0&&<><circle cx="200" cy="150" r="110" fill={b}/><circle cx="200" cy="150" r="60" fill={c}/></>}
    {k===1&&[...Array(8)].map((_,j)=><rect key={j} x={j*50} y="0" width={25+j*3} height="300" fill={j%2?b:c}/>)}
    {k===2&&<><path d="M0 300 L200 20 L400 300Z" fill={b}/><rect x="170" y="170" width="60" height="130" fill={c}/></>}
    {k===3&&[...Array(6)].map((_,j)=><circle key={j} cx={60+j*56} cy={150+(j%2?40:-40)} r={22+j*4} fill={j%2?b:c}/>)}</svg>);
}
