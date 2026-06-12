import { useState, useRef, useEffect } from "react";

const PLATFORMS = ["Wallapop", "Vinted", "Milanuncios", "Todocoleccion"];
const platformColors = {
  Wallapop: "#FF6B35", Vinted: "#09B1BA",
  Milanuncios: "#F5A623", Todocoleccion: "#A78BFA",
};

const PHOTO_SLOTS = [
  { id:0, label:"Vista frontal", icon:"🔲", hint:"Foto principal del objeto", required:true },
  { id:1, label:"Vista trasera", icon:"🔄", hint:"Parte trasera o lateral", required:false },
  { id:2, label:"Marca / etiqueta", icon:"🏷️", hint:"Detalle de marca o modelo", required:false },
];

const ONBOARDING_STEPS = [
  { emoji:"📸", title:"Fotografía desde varios ángulos", desc:"Toma hasta 3 fotos del objeto — frontal, trasera y detalle de marca — para un análisis más preciso.", color:"#09B1BA" },
  { emoji:"🔍", title:"La IA busca en tiempo real", desc:"Analizamos todas las perspectivas y buscamos precios actuales en Wallapop, Vinted, Milanuncios, Todocoleccion y más.", color:"#A78BFA" },
  { emoji:"💰", title:"Descubre su precio de venta", desc:"Te decimos exactamente a cuánto se está vendiendo ahora mismo para que sepas cuánto puedes ganar.", color:"#4ade80" },
];

const STREAK_MILESTONES = [3,7,14,30];
const streakMessage = n => {
  if (n>=30) return {emoji:"🏆",msg:"¡30 días! Eres una leyenda del resell."};
  if (n>=14) return {emoji:"⚡",msg:"¡2 semanas seguidas! Nada se te escapa."};
  if (n>=7)  return {emoji:"🔥",msg:"¡Una semana entera! El mercadillo te teme."};
  if (n>=3)  return {emoji:"💪",msg:"¡3 días seguidos! Vas cogiendo el ritmo."};
  return {emoji:"🔥",msg:`¡Llevas ${n} días buscando oportunidades!`};
};

function timeAgo(ts) {
  const d = Math.floor((Date.now()-ts)/1000);
  if (d<60) return "Ahora mismo";
  if (d<3600) return `Hace ${Math.floor(d/60)} min`;
  if (d<86400) return `Hace ${Math.floor(d/3600)}h`;
  return `Hace ${Math.floor(d/86400)}d`;
}

const LEGAL_SECTIONS = {
  privacidad: {
    title: "Política de Privacidad",
    content: [
      { heading: "1. Responsable del tratamiento", text: "ResellScan es una aplicación desarrollada por Daniel Gómez Padilla y Ferran, con domicilio en España. Contacto: danigomezpadilla@gmail.com" },
      { heading: "2. Datos que recogemos", text: "ResellScan no almacena tus fotos en ningún servidor propio. Las imágenes que subes se envían de forma temporal a la API de Anthropic (anthropic.com) únicamente para analizar el objeto y obtener precios de reventa. No se guardan, no se comparten con terceros y no se usan para ningún otro fin." },
      { heading: "3. Datos del historial", text: "El historial de búsquedas se almacena únicamente en tu dispositivo de forma local. En ningún momento se envía a servidores externos ni es accesible por los responsables de la app." },
      { heading: "4. Cookies y rastreo", text: "ResellScan no utiliza cookies de rastreo ni sistemas de analítica que identifiquen al usuario de forma personal." },
      { heading: "5. Tus derechos (RGPD)", text: "De acuerdo con el Reglamento General de Protección de Datos (RGPD) de la UE, tienes derecho de acceso, rectificación, supresión, limitación y portabilidad de tus datos. Para ejercerlos, escríbenos a danigomezpadilla@gmail.com" },
      { heading: "6. Menores de edad", text: "Esta aplicación no está dirigida a menores de 16 años. Si eres menor, consulta con tu tutor legal antes de usarla." },
      { heading: "7. Cambios en la política", text: "Podemos actualizar esta política en cualquier momento. Los cambios se publicarán dentro de la propia aplicación." },
    ]
  },
  terminos: {
    title: "Términos de Uso",
    content: [
      { heading: "1. Aceptación", text: "Al usar ResellScan aceptas estos términos en su totalidad. Si no estás de acuerdo, por favor deja de usar la aplicación." },
      { heading: "2. Uso permitido", text: "ResellScan es una herramienta de consulta de precios orientativos para objetos de segunda mano. Está diseñada para uso personal y no comercial a gran escala." },
      { heading: "3. Margen de error y limitación de responsabilidad", text: "Los precios mostrados son estimaciones basadas en anuncios activos en el momento del análisis. ResellScan no garantiza la exactitud de los precios. El precio final puede variar según el estado del objeto, la demanda, el modelo exacto y la plataforma. Los responsables de la app no se hacen responsables de pérdidas económicas derivadas del uso de esta información." },
      { heading: "4. Uso de inteligencia artificial", text: "ResellScan utiliza la API de Anthropic para el análisis de imágenes y la búsqueda de precios. El servicio puede estar sujeto a interrupciones o cambios por parte de dicho proveedor." },
      { heading: "5. Propiedad intelectual", text: "El nombre ResellScan, su diseño y código son propiedad de Daniel Gómez Padilla y Ferran. Queda prohibida su reproducción total o parcial sin autorización expresa." },
      { heading: "6. Modificaciones", text: "Nos reservamos el derecho de modificar, suspender o discontinuar la aplicación en cualquier momento sin previo aviso." },
      { heading: "7. Legislación aplicable", text: "Estos términos se rigen por la legislación española y europea. Para cualquier disputa, las partes se someten a los juzgados y tribunales de España." },
    ]
  },
  aviso: {
    title: "Aviso Legal",
    content: [
      { heading: "Responsables de la aplicación", text: "Daniel Gómez Padilla y Ferran, personas físicas con residencia en España." },
      { heading: "Contacto", text: "Para cualquier consulta legal, técnica o de privacidad, puedes escribirnos a: danigomezpadilla@gmail.com\n\nNos comprometemos a responder en un plazo máximo de 15 días hábiles." },
      { heading: "Actividad", text: "ResellScan es una aplicación de consulta de precios de reventa basada en inteligencia artificial. No somos una plataforma de compraventa ni intermediamos en ninguna transacción económica." },
      { heading: "Exención de responsabilidad", text: "ResellScan no es responsable del contenido de las plataformas externas consultadas (Wallapop, Vinted, Milanuncios, Todocoleccion) ni de los precios publicados en ellas. La información proporcionada tiene carácter meramente orientativo." },
      { heading: "Fecha de última actualización", text: "Junio de 2025." },
    ]
  }
};

function LegalScreen({ section, onBack }) {
  const data = LEGAL_SECTIONS[section];
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"1.5rem 1rem",fontFamily:"sans-serif",background:"#0e0e0e",color:"#f0f0f0",borderRadius:16,minHeight:500}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onBack} style={{fontSize:13,color:"#555",background:"none",border:"none",cursor:"pointer",padding:0}}>← Volver</button>
        <h2 style={{margin:0,fontSize:18,fontWeight:500,color:"#fff"}}>{data.title}</h2>
      </div>
      {data.content.map((block,i)=>(
        <div key={i} style={{marginBottom:20}}>
          <p style={{margin:"0 0 6px",fontSize:13,fontWeight:600,color:"#ccc"}}>{block.heading}</p>
          <p style={{margin:0,fontSize:13,color:"#666",lineHeight:1.7,whiteSpace:"pre-line"}}>{block.text}</p>
        </div>
      ))}
      <div style={{marginTop:24,padding:"14px 16px",background:"#141414",border:"0.5px solid #222",borderRadius:12,textAlign:"center"}}>
        <p style={{margin:"0 0 4px",fontSize:12,color:"#555"}}>¿Tienes alguna duda?</p>
        <a href="mailto:danigomezpadilla@gmail.com" style={{fontSize:13,color:"#09B1BA",textDecoration:"none"}}>danigomezpadilla@gmail.com</a>
      </div>
    </div>
  );
}

function Onboarding({onFinish}) {
  const [step,setStep] = useState(0);
  const cur = ONBOARDING_STEPS[step];
  const isLast = step===ONBOARDING_STEPS.length-1;
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"2rem 1.5rem",fontFamily:"sans-serif",background:"#0e0e0e",minHeight:500,borderRadius:16,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button onClick={onFinish} style={{fontSize:13,color:"#444",background:"none",border:"none",cursor:"pointer"}}>Saltar</button>
      </div>
      <div key={step} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"1rem 0",animation:"fadeUp 0.4s ease"}}>
        <div style={{width:120,height:120,borderRadius:"50%",background:`${cur.color}15`,border:`1.5px solid ${cur.color}33`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32,fontSize:52,animation:"pulse 2s ease-in-out infinite",boxShadow:`0 0 40px ${cur.color}22`}}>
          {cur.emoji}
        </div>
        <h2 style={{margin:"0 0 14px",fontSize:24,fontWeight:600,color:"#fff",lineHeight:1.3}}>{cur.title}</h2>
        <p style={{margin:0,fontSize:15,color:"#666",lineHeight:1.7,maxWidth:300}}>{cur.desc}</p>
        {step===1&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:24}}>
            {PLATFORMS.map(p=>(
              <span key={p} style={{fontSize:11,padding:"4px 10px",border:`0.5px solid ${platformColors[p]}44`,borderRadius:20,color:platformColors[p],background:`${platformColors[p]}11`}}>{p}</span>
            ))}
            <span style={{fontSize:11,padding:"4px 10px",border:"0.5px solid #333",borderRadius:20,color:"#555",fontStyle:"italic"}}>y más...</span>
          </div>
        )}
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
          {ONBOARDING_STEPS.map((_,i)=>(
            <div key={i} onClick={()=>setStep(i)} style={{width:i===step?24:8,height:8,borderRadius:999,background:i===step?cur.color:"#2a2a2a",transition:"all 0.3s",cursor:"pointer"}}/>
          ))}
        </div>
        <button onClick={()=>isLast?onFinish():setStep(s=>s+1)} style={{width:"100%",padding:"16px",fontSize:16,fontWeight:600,background:cur.color,color:"#000",border:"none",borderRadius:16,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          {isLast?"¡Empezar a escanear! 🚀":"Siguiente →"}
        </button>
        <p style={{margin:"16px 0 0",textAlign:"center",fontSize:12,color:"#333"}}>Por Daniel y Ferran · ResellScan</p>
      </div>
    </div>
  );
}

const SCAN_PHASES = [
  "Identificando objeto...",
  "Buscando en Wallapop...",
  "Buscando en Vinted...",
  "Buscando en Milanuncios...",
  "Calculando precio de venta...",
];

function ScanOverlay({count}) {
  const [phase, setPhase] = useState(0);
  const [particles, setParticles] = useState([]);
  const [lineY, setLineY] = useState(0);
    const startRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let phaseTimer = setInterval(() => {
      setPhase(p => (p + 1) % SCAN_PHASES.length);
    }, 1800);
    return () => clearInterval(phaseTimer);
  }, []);

  useEffect(() => {
    let frameId;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const period = 2;
      const t = (elapsed % period) / period;
      const y = t < 0.5 ? t * 2 : 2 - t * 2;
      setLineY(y * 100);

      // Spawn particles along the line occasionally
      if (Math.random() < 0.3) {
        const id = Math.random();
        setParticles(prev => [...prev.slice(-18), {
          id, x: Math.random() * 100, y: y * 100,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.5 - 0.5,
          life: 1, size: Math.random() * 3 + 1
        }]);
      }
      setParticles(prev => prev
        .map(p => ({...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.04}))
        .filter(p => p.life > 0)
      );
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={containerRef} style={{position:"absolute",inset:0,borderRadius:16,overflow:"hidden",zIndex:2}}>
      <style>{`
        @keyframes cornerPulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes phaseIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes progressBar{from{width:0%}to{width:100%}}
      `}</style>

      {/* Dark overlay */}
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>

      {/* Scan line with glow + trail */}
      <div style={{position:"absolute",left:0,right:0,top:`${lineY}%`,pointerEvents:"none"}}>
        {/* Trail above */}
        <div style={{position:"absolute",left:0,right:0,bottom:2,height:20,background:"linear-gradient(to top,#09B1BA18,transparent)"}}/>
        {/* Main line */}
        <div style={{height:2,background:"linear-gradient(90deg,transparent 0%,#09B1BA88 15%,#09B1BA 40%,#ffffff 50%,#09B1BA 60%,#09B1BA88 85%,transparent 100%)",boxShadow:"0 0 8px #09B1BA,0 0 20px #09B1BA66,0 0 40px #09B1BA22"}}/>
        {/* Trail below */}
        <div style={{position:"absolute",left:0,right:0,top:2,height:12,background:"linear-gradient(to bottom,#09B1BA22,transparent)"}}/>
      </div>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size,
          borderRadius:"50%",
          background:"#09B1BA",
          opacity: p.life * 0.8,
          pointerEvents:"none",
          boxShadow:`0 0 ${p.size*2}px #09B1BA`
        }}/>
      ))}

      {/* Corner brackets */}
      {[{top:10,left:10,r:0},{top:10,right:10,r:90},{bottom:44,left:10,r:270},{bottom:44,right:10,r:180}].map((pos,i)=>(
        <div key={i} style={{position:"absolute",width:22,height:22,top:pos.top,left:pos.left,right:pos.right,bottom:pos.bottom,animation:`cornerPulse 1.2s ease-in-out ${i*0.3}s infinite`}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 12 L2 2 L12 2" stroke="#09B1BA" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${pos.r} 11 11)`}/>
          </svg>
        </div>
      ))}

      {/* Phase text + progress bar */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)",padding:"20px 14px 10px"}}>
        <div key={phase} style={{animation:"phaseIn 0.4s ease",marginBottom:6,textAlign:"center"}}>
          <span style={{fontSize:11,color:"#09B1BA",letterSpacing:1.5,textTransform:"uppercase"}}>{SCAN_PHASES[phase]}</span>
        </div>
        <div style={{height:2,background:"#ffffff11",borderRadius:999,overflow:"hidden"}}>
          <div key={phase} style={{height:"100%",background:"linear-gradient(90deg,#09B1BA,#60a5fa)",borderRadius:999,animation:`progressBar ${1800}ms linear forwards`}}/>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({slot,photo,onAdd,onRemove}) {
  const ref = useRef();
  const containerRef = useRef();

  return (
    <div style={{flex:1,minWidth:0}}>
      {photo?(
        <div style={{position:"relative"}}>
          <div ref={containerRef} style={{position:"relative",borderRadius:12,overflow:"hidden"}}>
            <img src={photo} alt={slot.label} style={{width:"100%",height:100,objectFit:"cover",display:"block"}}/>
            {/* Framing guide corners */}
            <svg style={{position:"absolute",top:6,left:6}} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 10 L2 2 L10 2" stroke="#09B1BA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",top:6,right:6}} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16 10 L16 2 L8 2" stroke="#09B1BA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",bottom:6,left:6}} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 8 L2 16 L10 16" stroke="#09B1BA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",bottom:6,right:6}} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16 8 L16 16 L8 16" stroke="#09B1BA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:16,height:16}}>
              <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"#09B1BA55",transform:"translateY(-50%)"}}/>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"#09B1BA55",transform:"translateX(-50%)"}}/>
            </div>
          </div>

          {/* Controls row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
            <span style={{fontSize:10,color:"#555"}}>{slot.label}</span>
            <button onClick={onRemove} style={{fontSize:10,padding:"2px 7px",borderRadius:6,border:"0.5px solid #5a1a1a",background:"#2a0a0a",color:"#ff6b6b",cursor:"pointer"}}>✕ Eliminar</button>
          </div>
        </div>
      ):(
        <div style={{position:"relative"}}>
          <div onClick={()=>ref.current.click()} style={{width:"100%",height:100,border:`1.5px dashed ${slot.required?"#09B1BA44":"#2a2a2a"}`,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#141414",gap:4,position:"relative",overflow:"hidden"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=slot.required?"#09B1BA":"#555"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=slot.required?"#09B1BA44":"#2a2a2a"}>
            {/* Empty framing guide */}
            <svg style={{position:"absolute",top:6,left:6}} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 9 L2 2 L9 2" stroke={slot.required?"#09B1BA44":"#333"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",top:6,right:6}} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 9 L14 2 L7 2" stroke={slot.required?"#09B1BA44":"#333"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",bottom:6,left:6}} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 7 L2 14 L9 14" stroke={slot.required?"#09B1BA44":"#333"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <svg style={{position:"absolute",bottom:6,right:6}} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 7 L14 14 L7 14" stroke={slot.required?"#09B1BA44":"#333"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{fontSize:22}}>{slot.icon}</span>
            <span style={{fontSize:11,color:slot.required?"#09B1BA":"#555",fontWeight:slot.required?500:400}}>{slot.label}</span>
            <span style={{fontSize:9,color:slot.required?"#09B1BA88":"#444",textTransform:"uppercase",letterSpacing:1}}>{slot.required?"Obligatoria":"Opcional"}</span>
          </div>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onAdd(e.target.files[0]);}}/>
    </div>
  );
}

function PriceChart({data,globalMin,globalMax}) {
  const active=PLATFORMS.filter(p=>data[p]?.disponible&&data[p]?.avg>0);
  if(!active.length)return null;
  const pad=(globalMax-globalMin)*0.1||1;
  const dMin=Math.max(0,globalMin-pad),dMax=globalMax+pad;
  const toX=v=>((v-dMin)/(dMax-dMin))*100;
  return (
    <div style={{background:"#141414",border:"0.5px solid #222",borderRadius:14,padding:"16px 16px 12px",marginBottom:16}}>
      <p style={{fontSize:12,color:"#444",textTransform:"uppercase",letterSpacing:1,margin:"0 0 16px"}}>Rango de precios por plataforma</p>
      {active.map((p,i)=>{
        const c=platformColors[p];
        const minX=toX(data[p].min),maxX=toX(data[p].max),avgX=toX(data[p].avg);
        return (
          <div key={p} style={{marginBottom:i<active.length-1?14:4}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
                <span style={{fontSize:12,color:"#aaa"}}>{p}</span>
              </div>
              <span style={{fontSize:12,color:"#fff",fontWeight:500}}>{data[p].avg}€</span>
            </div>
            <div style={{position:"relative",height:10,background:"#222",borderRadius:999}}>
              <div style={{position:"absolute",top:0,left:`${minX}%`,width:`${Math.max(maxX-minX,1.5)}%`,height:"100%",background:`${c}44`,borderRadius:999}}/>
              <div style={{position:"absolute",top:"50%",left:`${avgX}%`,transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:c,border:"2px solid #0e0e0e",boxShadow:`0 0 6px ${c}88`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              <span style={{fontSize:10,color:"#555"}}>{data[p].min}€</span>
              <span style={{fontSize:10,color:"#555"}}>{data[p].max}€</span>
            </div>
          </div>
        );
      })}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,borderTop:"0.5px solid #1e1e1e",paddingTop:6}}>
        <span style={{fontSize:10,color:"#333"}}>{Math.round(dMin)}€</span>
        <span style={{fontSize:10,color:"#333"}}>{Math.round((dMin+dMax)/2)}€</span>
        <span style={{fontSize:10,color:"#333"}}>{Math.round(dMax)}€</span>
      </div>
    </div>
  );
}

function PriceBar({platform,min,max,avg}) {
  const c=platformColors[platform]||"#888";
  return (
    <div style={{background:"#1a1a1a",border:"0.5px solid #2a2a2a",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:c}}/>
          <span style={{fontWeight:500,fontSize:15,color:"#f0f0f0"}}>{platform}</span>
        </div>
        <span style={{fontSize:18,fontWeight:500,color:"#fff"}}>{avg}€ <span style={{fontSize:12,color:"#555",fontWeight:400}}>media</span></span>
      </div>
      <div style={{display:"flex",gap:16}}>
        <span style={{fontSize:12,color:"#555"}}>Mín: <b style={{color:"#aaa"}}>{min}€</b></span>
        <span style={{fontSize:12,color:"#555"}}>Máx: <b style={{color:"#aaa"}}>{max}€</b></span>
      </div>
    </div>
  );
}

function ShareCard({result,imageData,cardRef}) {
  const active=PLATFORMS.filter(p=>result.plataformas[p]?.disponible&&result.plataformas[p]?.avg>0);
  return (
    <div ref={cardRef} style={{position:"fixed",left:"-9999px",top:0,width:360,background:"#0e0e0e",borderRadius:20,padding:24,fontFamily:"sans-serif",color:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><p style={{margin:0,fontSize:18,fontWeight:600}}>ResellScan</p><p style={{margin:0,fontSize:11,color:"#555"}}>resellscan.app</p></div>
        <p style={{margin:0,fontSize:11,color:"#444"}}>{new Date().toLocaleDateString("es-ES")}</p>
      </div>
      {imageData&&<img src={imageData} alt="obj" style={{width:"100%",height:160,objectFit:"cover",borderRadius:12,marginBottom:14}}/>}
      <p style={{margin:"0 0 4px",fontSize:16,fontWeight:600}}>{result.objeto}</p>
      <p style={{margin:"0 0 14px",fontSize:12,color:"#666"}}>{result.descripcion}</p>
      <div style={{background:"linear-gradient(135deg,#0a1a2f,#0d2040)",border:"0.5px solid #1a3a6a",borderRadius:12,padding:"14px",textAlign:"center",marginBottom:14}}>
        <p style={{margin:"0 0 4px",fontSize:11,color:"#4a7aaa",textTransform:"uppercase",letterSpacing:1}}>Se está vendiendo a</p>
        <p style={{margin:"0 0 4px",fontSize:36,fontWeight:700,color:"#60a5fa"}}>{result.precio_medio_global}€</p>
        <p style={{margin:0,fontSize:11,color:"#4a6a8a"}}>Precio real ahora mismo</p>
      </div>
      {active.map(p=>(
        <div key={p} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"0.5px solid #1a1a1a"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:platformColors[p]}}/>
            <span style={{fontSize:12,color:"#aaa"}}>{p}</span>
          </div>
          <span style={{fontSize:13,fontWeight:500}}>{result.plataformas[p].avg}€</span>
        </div>
      ))}
      <p style={{margin:"16px 0 0",fontSize:11,color:"#333",textAlign:"center"}}>Descarga ResellScan · Por Daniel y Ferran</p>
    </div>
  );
}

function todayKey(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function yesterdayKey(){const d=new Date(Date.now()-86400000);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}

export default function ResellScan() {
  const [showOnboarding,setShowOnboarding] = useState(null);
  const [legalScreen,setLegalScreen] = useState(null); // null | 'privacidad' | 'terminos' | 'aviso'
  const [screen,setScreen] = useState("home");
  const [photos,setPhotos] = useState([null,null,null]);
  const [photoPreviews,setPhotoPreviews] = useState([null,null,null]);
  const [result,setResult] = useState(null);
  const [error,setError] = useState(null);
  const [history,setHistory] = useState([]);
  const [activeTab,setActiveTab] = useState("scan");
  const [sharing,setSharing] = useState(false);
  const [streak,setStreak] = useState(0);
  const [streakBanner,setStreakBanner] = useState(null);
  const cardRef = useRef();

  useEffect(()=>{
    (async()=>{
      try{
        const ob=await window.storage.get("resellscan_onboarded");
        setShowOnboarding(!ob);
        const h=await window.storage.get("resellscan_history");
        if(h?.value)setHistory(JSON.parse(h.value));
        const s=await window.storage.get("resellscan_streak");
        if(s?.value){const{count,lastDay}=JSON.parse(s.value);if(lastDay===todayKey()||lastDay===yesterdayKey())setStreak(count);}
      }catch(_){setShowOnboarding(true);}
    })();
  },[]);

  const finishOnboarding=async()=>{
    try{await window.storage.set("resellscan_onboarded","1");}catch(_){}
    setShowOnboarding(false);
  };

  const saveHistory=async h=>{setHistory(h);try{await window.storage.set("resellscan_history",JSON.stringify(h));}catch(_){}};

  const updateStreak=async()=>{
    try{
      const s=await window.storage.get("resellscan_streak");
      let count=1,lastDay="";
      if(s?.value){const d=JSON.parse(s.value);lastDay=d.lastDay;count=d.count;}
      const today=todayKey();
      if(lastDay===today)return;
      const newCount=lastDay===yesterdayKey()?count+1:1;
      await window.storage.set("resellscan_streak",JSON.stringify({count:newCount,lastDay:today}));
      setStreak(newCount);
      if(STREAK_MILESTONES.includes(newCount)){setStreakBanner(streakMessage(newCount));setTimeout(()=>setStreakBanner(null),5000);}
      else if(newCount>1){setStreakBanner({emoji:"🔥",msg:`¡Llevas ${newCount} días seguidos buscando oportunidades!`});setTimeout(()=>setStreakBanner(null),4000);}
    }catch(_){}
  };

  const addPhoto=(idx,file)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      setPhotos(prev=>{const n=[...prev];n[idx]=file;return n;});
      setPhotoPreviews(prev=>{const n=[...prev];n[idx]=e.target.result;return n;});
    };
    reader.readAsDataURL(file);
  };

  const removePhoto=idx=>{
    setPhotos(prev=>{const n=[...prev];n[idx]=null;return n;});
    setPhotoPreviews(prev=>{const n=[...prev];n[idx]=null;return n;});
  };

  const filledCount=photos.filter(Boolean).length;
  const canAnalyze=photos[0]!==null;

  const analyze=async()=>{
    setError(null);setResult(null);setScreen("analyzing");
    try{
      const imageContents=[];
      for(let i=0;i<photos.length;i++){
        if(!photos[i])continue;
        const base64=photoPreviews[i].split(",")[1];
        const mediaType=photos[i].type||"image/jpeg";
        imageContents.push({type:"image",source:{type:"base64",media_type:mediaType,data:base64}});
        imageContents.push({type:"text",text:`Perspectiva ${i+1}: ${PHOTO_SLOTS[i].label}`});
      }
      imageContents.push({type:"text",text:`Analiza estas ${filledCount} perspectivas del mismo objeto para identificarlo con precisión y busca sus precios de reventa en España. Responde solo con el JSON.`});
      const {GoogleGenerativeAI}=await import('@google/generative-ai');const genAI=new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);const model=genAI.getGenerativeModel({model:'gemini-1.5-flash'});const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_KEY}`,{/gemini-1.5-flash:generateContent?key=${apiKey}`,{
        method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          system:`Eres un experto en precios de reventa en España. El usuario te enviará ${filledCount} imágenes del mismo objeto desde distintos ángulos. Usa todas las perspectivas para identificar con máxima precisión el objeto (marca exacta, modelo, versión, estado aparente). Luego busca precios actuales en Wallapop, Vinted, Milanuncios y Todocoleccion. Responde SOLO con JSON válido sin markdown:
{"objeto":"nombre completo y preciso","categoria":"cat","descripcion":"1 frase","plataformas":{"Wallapop":{"min":0,"max":0,"avg":0,"disponible":true},"Vinted":{"min":0,"max":0,"avg":0,"disponible":true},"Milanuncios":{"min":0,"max":0,"avg":0,"disponible":true},"Todocoleccion":{"min":0,"max":0,"avg":0,"disponible":true}},"precio_minimo_global":0,"precio_maximo_global":0,"precio_medio_global":0,"consejo":"consejo breve"}`,
          messages:[{role:"user",content:imageContents}]
        })
      });
      const data=await res.json();
      const text=data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);setScreen("results");
      const entry={id:Date.now(),timestamp:Date.now(),...parsed,imagen:photoPreviews[0]};
      saveHistory([entry,...history.slice(0,19)]);
      await updateStreak();
    }catch(e){
      setError("No se pudo analizar las fotos. Intenta de nuevo.");
      setScreen("home");
    }
  };

  const handleShare=async()=>{
    setSharing(true);
    await new Promise(r=>setTimeout(r,100));
    try{
      const html2canvas = (await import('html2canvas')).default;
      const canvas=await html2canvas(cardRef.current,{backgroundColor:"#0e0e0e",scale:2,useCORS:true,allowTaint:true});
      canvas.toBlob(async blob=>{
        const file=new File([blob],"resellscan.png",{type:"image/png"});
        if(navigator.share&&navigator.canShare({files:[file]})){
          await navigator.share({files:[file],title:"ResellScan",text:`${result.objeto} — ${result.precio_medio_global}€`});
        }else{
          const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="resellscan-resultado.png";a.click();
        }
        setSharing(false);
      },"image/png");
    }catch(e){setSharing(false);}
  };

  const reset=()=>{setScreen("home");setPhotos([null,null,null]);setPhotoPreviews([null,null,null]);setResult(null);setError(null);};
  const openEntry=e=>{setPhotoPreviews([e.imagen,null,null]);setResult(e);setScreen("results");};
  const active=result?PLATFORMS.filter(p=>result.plataformas[p]?.disponible&&result.plataformas[p]?.avg>0):[];

  if(showOnboarding===null)return <div style={{background:"#0e0e0e",minHeight:500,borderRadius:16}}/>;
  if(showOnboarding)return <Onboarding onFinish={finishOnboarding}/>;
  if(legalScreen)return <LegalScreen section={legalScreen} onBack={()=>setLegalScreen(null)}/>;

  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"1.5rem 1rem",fontFamily:"sans-serif",background:"#0e0e0e",color:"#f0f0f0",borderRadius:16,minHeight:500,position:"relative"}}>

      {streakBanner&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#1a1a1a",border:"0.5px solid #333",borderRadius:14,padding:"12px 20px",zIndex:999,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",maxWidth:400,width:"calc(100% - 32px)"}}>
          <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          <span style={{fontSize:22}}>{streakBanner.emoji}</span>
          <p style={{margin:0,fontSize:13,color:"#f0f0f0",lineHeight:1.4}}>{streakBanner.msg}</p>
          <button onClick={()=>setStreakBanner(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:16,padding:0,flexShrink:0}}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width="36" height="36" viewBox="0 0 680 680" style={{flexShrink:0}}>
            <defs>
              <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0a0e1a"/><stop offset="100%" stopColor="#060810"/>
              </linearGradient>
              <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e2a3a"/><stop offset="100%" stopColor="#080c14"/>
              </linearGradient>
              <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
              </linearGradient>
              <clipPath id="ic"><rect x="40" y="40" width="600" height="600" rx="130"/></clipPath>
            </defs>
            <rect x="40" y="40" width="600" height="600" rx="130" fill="url(#bgG)"/>
            <g clipPath="url(#ic)">
              <rect x="120" y="265" width="440" height="300" rx="36" fill="#111827" stroke="#1e2d40" strokeWidth="1.5"/>
              <rect x="215" y="225" width="130" height="54" rx="18" fill="#111827" stroke="#1e2d40" strokeWidth="1.5"/>
              <circle cx="400" cy="252" r="12" fill="#09B1BA"/>
              <circle cx="340" cy="418" r="112" fill="url(#lG)" stroke="#09B1BA" strokeWidth="2.5"/>
              <circle cx="340" cy="418" r="86" fill="#050810"/>
              <ellipse cx="330" cy="375" rx="48" ry="22" fill="url(#sG)"/>
              <path d="M388 378 A62 62 0 1 0 388 458" fill="none" stroke="#09B1BA" strokeWidth="22" strokeLinecap="round"/>
              <line x1="272" y1="408" x2="348" y2="408" stroke="#09B1BA" strokeWidth="16" strokeLinecap="round"/>
              <line x1="272" y1="430" x2="348" y2="430" stroke="#09B1BA" strokeWidth="16" strokeLinecap="round"/>
            </g>
          </svg>
          <div>
            <h1 style={{margin:0,fontSize:22,fontWeight:500,letterSpacing:-0.5,color:"#fff"}}>ResellScan</h1>
            <p style={{margin:0,fontSize:13,color:"#555"}}>Precio de reventa al instante</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {streak>0&&(
            <div style={{display:"flex",alignItems:"center",gap:5,background:"#1f1a0a",border:"0.5px solid #3a2a00",borderRadius:20,padding:"4px 10px"}}>
              <span style={{fontSize:14}}>🔥</span>
              <span style={{fontSize:13,fontWeight:600,color:"#F5A623"}}>{streak}</span>
            </div>
          )}
          {screen!=="home"&&<button onClick={reset} style={{fontSize:13,color:"#555",background:"none",border:"none",cursor:"pointer"}}>← Volver</button>}
        </div>
      </div>

      {/* Tabs */}
      {screen==="home"&&(
        <div style={{display:"flex",background:"#181818",borderRadius:12,padding:4,marginBottom:24}}>
          {[{id:"scan",label:"📸 Escanear"},{id:"history",label:`🕒 Historial${history.length>0?` (${history.length})`:""}`}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"8px 0",fontSize:13,fontWeight:500,border:"none",borderRadius:9,cursor:"pointer",background:activeTab===t.id?"#2a2a2a":"transparent",color:activeTab===t.id?"#fff":"#555",transition:"all 0.2s"}}>{t.label}</button>
          ))}
        </div>
      )}

      {/* SCAN TAB */}
      {screen==="home"&&activeTab==="scan"&&(
        <div>
          {error&&<div style={{background:"#2a0a0a",border:"0.5px solid #5a1a1a",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#ff6b6b"}}>{error}</div>}
          {streak>1&&!streakBanner&&(
            <div style={{background:"#1a1500",border:"0.5px solid #2e2200",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🔥</span>
              <p style={{margin:0,fontSize:13,color:"#c8860a"}}><strong>{streak} días</strong> seguidos buscando oportunidades. ¡Sigue así!</p>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{margin:0,fontSize:13,color:"#aaa",fontWeight:500}}>Añade fotos del objeto</p>
              <span style={{fontSize:12,color:filledCount>0?"#09B1BA":"#555"}}>{filledCount}/3 fotos</span>
            </div>
            <div style={{height:3,background:"#222",borderRadius:999,marginBottom:14}}>
              <div style={{height:"100%",width:`${(filledCount/3)*100}%`,background:"#09B1BA",borderRadius:999,transition:"width 0.3s"}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              {PHOTO_SLOTS.map(slot=>(
                <PhotoSlot key={slot.id} slot={slot} photo={photoPreviews[slot.id]} onAdd={f=>addPhoto(slot.id,f)} onRemove={()=>removePhoto(slot.id)}/>
              ))}
            </div>
            {filledCount>1&&<p style={{margin:"10px 0 0",fontSize:12,color:"#09B1BA44",textAlign:"center"}}>✓ {filledCount} perspectivas · análisis más preciso</p>}
          </div>

          <button onClick={analyze} disabled={!canAnalyze} style={{width:"100%",padding:"15px",fontSize:15,fontWeight:600,background:canAnalyze?"#09B1BA":"#1a1a1a",color:canAnalyze?"#000":"#444",border:"none",borderRadius:14,cursor:canAnalyze?"pointer":"not-allowed",transition:"all 0.2s",marginBottom:20}}>
            {canAnalyze?`🔍 Analizar${filledCount>1?` (${filledCount} fotos)`:""}` :"Añade al menos una foto"}
          </button>

          <div style={{marginBottom:28}}>
            <p style={{fontSize:12,color:"#444",textTransform:"uppercase",letterSpacing:1,margin:"0 0 12px"}}>Plataformas consultadas</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              {PLATFORMS.map(p=>(
                <span key={p} style={{fontSize:12,padding:"4px 12px",border:`0.5px solid ${platformColors[p]}33`,borderRadius:20,color:platformColors[p],fontWeight:500,background:`${platformColors[p]}11`}}>{p}</span>
              ))}
              <span style={{fontSize:12,padding:"4px 12px",border:"0.5px solid #333",borderRadius:20,color:"#555",fontStyle:"italic"}}>y muchas más...</span>
            </div>
          </div>

          <button onClick={()=>setShowOnboarding(true)} style={{width:"100%",padding:"11px",fontSize:13,color:"#444",background:"none",border:"0.5px solid #222",borderRadius:12,cursor:"pointer",marginBottom:20}}>
            ¿Cómo funciona ResellScan? →
          </button>

          <div style={{background:"#141414",border:"0.5px solid #222",borderRadius:16,padding:"20px 18px",marginBottom:24}}>
            <p style={{margin:"0 0 6px",fontSize:12,color:"#444",textTransform:"uppercase",letterSpacing:1}}>Nuestra historia</p>
            <p style={{margin:"0 0 12px",fontSize:15,fontWeight:500,color:"#f0f0f0",lineHeight:1.5}}>Nació de una pasión, no de una hoja de cálculo.</p>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#777",lineHeight:1.7}}>Somos <strong style={{color:"#ddd"}}>Daniel y Ferran</strong>, y como muchos de vosotros, llevamos años dedicando tiempo libre —y algún que otro fin de semana entero— a buscar objetos con potencial de reventa.</p>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#777",lineHeight:1.7}}>Pero siempre había una pregunta que frenaba el impulso: <em style={{color:"#aaa"}}>¿Cuánto vale esto realmente?</em> Abrir cuatro apps, buscar en cada una... mientras tanto, alguien más se lleva la pieza.</p>
            <p style={{margin:0,fontSize:13,color:"#555",lineHeight:1.7,borderTop:"0.5px solid #222",paddingTop:12,fontStyle:"italic"}}>Esta app es para ti. Para el que madruga en el mercadillo, para el que guarda cajas con cariño, para el que convierte la curiosidad en oportunidad.</p>
          </div>

          {/* Legal footer */}
          <div style={{borderTop:"0.5px solid #1a1a1a",paddingTop:16,textAlign:"center"}}>
            <p style={{margin:"0 0 10px",fontSize:11,color:"#333"}}>© 2025 ResellScan · Daniel y Ferran</p>
            <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
              {[{key:"privacidad",label:"Política de privacidad"},{key:"terminos",label:"Términos de uso"},{key:"aviso",label:"Aviso legal"}].map(l=>(
                <button key={l.key} onClick={()=>setLegalScreen(l.key)} style={{fontSize:12,color:"#444",background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline",textDecorationColor:"#2a2a2a"}}>
                  {l.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {screen==="home"&&activeTab==="history"&&(
        <div>
          {history.length===0?(
            <div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <div style={{fontSize:36,marginBottom:12}}>🕒</div>
              <p style={{color:"#555",fontSize:14,margin:0}}>Todavía no has escaneado ningún objeto.</p>
            </div>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <p style={{fontSize:12,color:"#444",textTransform:"uppercase",letterSpacing:1,margin:0}}>{history.length} objetos escaneados</p>
                <button onClick={()=>saveHistory([])} style={{fontSize:12,color:"#ff6b6b",background:"none",border:"0.5px solid #5a1a1a",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>Borrar todo</button>
              </div>
              {history.map(e=>(
                <div key={e.id} style={{display:"flex",gap:12,alignItems:"center",background:"#141414",border:"0.5px solid #222",borderRadius:12,padding:"12px 14px",marginBottom:10,transition:"border-color 0.2s"}} onMouseEnter={el=>el.currentTarget.style.borderColor="#444"} onMouseLeave={el=>el.currentTarget.style.borderColor="#222"}>
                  <img src={e.imagen} alt={e.objeto} onClick={()=>openEntry(e)} style={{width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0,cursor:"pointer"}}/>
                  <div onClick={()=>openEntry(e)} style={{flex:1,minWidth:0,cursor:"pointer"}}>
                    <p style={{margin:"0 0 2px",fontWeight:500,fontSize:14,color:"#f0f0f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.objeto}</p>
                    <p style={{margin:"0 0 4px",fontSize:12,color:"#555",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.descripcion}</p>
                    <p style={{margin:0,fontSize:11,color:"#444"}}>{timeAgo(e.timestamp)}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                    <div style={{textAlign:"right"}}>
                      <p style={{margin:"0 0 2px",fontSize:16,fontWeight:500,color:"#60a5fa"}}>{e.precio_medio_global}€</p>
                      <p style={{margin:0,fontSize:11,color:"#555"}}>venta</p>
                    </div>
                    <button onClick={()=>saveHistory(history.filter(h=>h.id!==e.id))} style={{background:"#2a0a0a",border:"0.5px solid #5a1a1a",borderRadius:8,padding:"3px 9px",fontSize:11,color:"#ff6b6b",cursor:"pointer"}}>✕ Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYZING */}
      {screen==="analyzing"&&(
        <div>
          {photoPreviews[0]&&(
            <div style={{position:"relative",marginBottom:20}}>
              <img src={photoPreviews[0]} alt="objeto" style={{width:"100%",borderRadius:16,maxHeight:280,objectFit:"cover",display:"block"}}/>
              <ScanOverlay count={filledCount}/>
            </div>
          )}
          {filledCount>1&&(
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {photoPreviews.slice(1).map((p,i)=>p&&(
                <img key={i} src={p} alt={`vista ${i+2}`} style={{width:60,height:60,borderRadius:8,objectFit:"cover",border:"0.5px solid #09B1BA44"}}/>
              ))}
            </div>
          )}
          <div style={{textAlign:"center"}}>
            <p style={{color:"#555",fontSize:13,margin:0}}>Analizando {filledCount} {filledCount===1?"perspectiva":"perspectivas"} · Buscando en todas las plataformas...</p>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {screen==="results"&&result&&(
        <div>
          {photoPreviews[0]&&<img src={photoPreviews[0]} alt="objeto" style={{width:"100%",borderRadius:16,marginBottom:16,maxHeight:220,objectFit:"cover"}}/>}
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:500,color:"#fff"}}>{result.objeto}</h2>
          <p style={{margin:"0 0 16px",fontSize:13,color:"#555"}}>{result.descripcion}</p>

          <div style={{background:"linear-gradient(135deg,#0a1a2f,#0d2040)",border:"0.5px solid #1a3a6a",borderRadius:16,padding:"22px 20px",marginBottom:16,textAlign:"center"}}>
            <p style={{margin:"0 0 6px",fontSize:12,color:"#4a7aaa",textTransform:"uppercase",letterSpacing:2}}>Se está vendiendo a</p>
            <p style={{margin:"0 0 6px",fontSize:52,fontWeight:700,color:"#60a5fa",letterSpacing:-2,lineHeight:1}}>{result.precio_medio_global}€</p>
            <p style={{margin:"0 0 6px",fontSize:13,color:"#4a6a8a"}}>Precio al que se cierran las ventas ahora mismo</p>
            <p style={{margin:"0 0 14px",fontSize:11,color:"#2a4a6a",fontStyle:"italic"}}>⚡ Estimación orientativa · puede variar según estado y demanda</p>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#ffffff08",border:"0.5px solid #ffffff11",borderRadius:12,padding:"8px 16px"}}>
              <span style={{fontSize:12,color:"#888"}}>Precio máximo visto:</span>
              <span style={{fontSize:15,fontWeight:600,color:"#ccc"}}>{result.precio_maximo_global}€</span>
            </div>
          </div>

          <PriceChart data={result.plataformas} globalMin={result.precio_minimo_global} globalMax={result.precio_maximo_global}/>

          <p style={{fontSize:12,color:"#444",textTransform:"uppercase",letterSpacing:1,margin:"0 0 10px"}}>Detalle por plataforma</p>
          {active.length>0?active.map(p=><PriceBar key={p} platform={p} {...result.plataformas[p]}/>):<p style={{color:"#444",fontSize:14}}>No se encontraron resultados.</p>}

          {result.consejo&&(
            <div style={{marginTop:16,background:"#12121f",border:"0.5px solid #2a2a4a",borderRadius:12,padding:"12px 16px"}}>
              <p style={{margin:0,fontSize:13,color:"#7a8fff"}}>💡 {result.consejo}</p>
            </div>
          )}

          <div style={{marginTop:14,background:"#141414",border:"0.5px solid #222",borderRadius:12,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
            <p style={{margin:0,fontSize:12,color:"#555",lineHeight:1.6}}>
              Estos precios son <strong style={{color:"#666"}}>estimaciones orientativas</strong> basadas en anuncios activos. El precio final puede variar según el estado del objeto, la demanda del momento, el modelo exacto y la plataforma elegida.
            </p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20}}>
            <button onClick={handleShare} disabled={sharing} style={{padding:"13px",fontSize:14,fontWeight:500,background:"#1a1a1a",color:sharing?"#555":"#fff",border:"0.5px solid #2a2a2a",borderRadius:14,cursor:sharing?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {sharing?"Generando...":"📤 Compartir"}
            </button>
            <button onClick={reset} style={{padding:"13px",fontSize:14,fontWeight:500,background:"#fff",color:"#111",border:"none",borderRadius:14,cursor:"pointer"}}>
              📸 Nuevo escaneo
            </button>
          </div>
        </div>
      )}

      {result&&<ShareCard result={result} imageData={photoPreviews[0]} cardRef={cardRef}/>}
    </div>
  );
}