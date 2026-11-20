const {makeEnv,vm,fs}=require('./harness.js');
const js=fs.readFileSync('SNIFF_JS.js','utf8');
const rect={left:0,top:100,right:360,bottom:300,width:360,height:200};
const URL_OF={1080:'https://pimpbunny.com/get_file/9/aaa/1/2/x_1080p.mp4/',720:'https://pimpbunny.com/get_file/9/bbb/1/2/x_720p.mp4/',480:'https://pimpbunny.com/get_file/9/ccc/1/2/x_480p.mp4/',360:'https://pimpbunny.com/get_file/9/ddd/1/2/x_360p.mp4/'};
async function scenario(name,{noChange=[],abortedEntry=true}){
  const video={tagName:'VIDEO',currentSrc:URL_OF[720],_r:rect,getBoundingClientRect(){return rect},paused:true,ended:false,muted:false,duration:3600,videoHeight:720,
    play(){this.paused=false;this.plays=(this.plays||0)+1;return Promise.resolve()},pause(){this.paused=true},load(){},parentElement:null,className:'',id:'',getAttribute(){return null}};
  const scn={url:'https://pimpbunny.com/videos/x/',video};
  const env=makeEnv(scn); const {ctx,calls,El}=env;
  const items=[1080,720,480,360].map((h,i)=>{
    const it=new El({tagName:'LI',textContent:h+'p',className:h===720?'active':'',_r:{left:200,top:110+i*30,right:340,bottom:135+i*30,width:140,height:25}});
    it._onEvent=(ev)=>{ if(ev.type==='click' && !noChange.includes(h)){video.currentSrc=URL_OF[h];video.videoHeight=h;} };
    return it;});
  ctx.document.body._q=(sel)=>items;
  // lo que vio la red: la carga abortada de la calidad anterior (no debe usarse)
  let seen=[];
  ctx.performance={getEntriesByType:()=>abortedEntry?seen.map(n=>({name:n})):[]};
  const origPress=items.forEach(it=>{const o=it._onEvent;it._onEvent=(ev)=>{ if(ev.type==='click')seen.push('https://st46.pimpbunny.com/remote_control.php?file=ABORTED_'+video.currentSrc.slice(-12)); o(ev);};});
  vm.createContext(ctx); vm.runInContext(js,ctx);
  await ctx.__fluxHarvest();
  const m2=calls.filter(c=>c[0]==='media2').map(c=>({url:c[1].slice(-26),h:c[3],src:c[5]}));
  console.log('==',name);
  console.log('auto:',JSON.stringify(calls.filter(c=>c[0]==='auto').map(c=>c[1])),'plays:',video.plays,'quedó pausado:',video.paused,'muted final:',video.muted,'src final:',video.currentSrc.slice(-16));
  console.log('enviadas:',JSON.stringify(m2));
  console.log('notas:',calls.filter(c=>c[0]==='note').map(c=>c[1]).join(' | '));
  return {m2,calls};
}
(async()=>{
  const a=await scenario('Bunny: 4 calidades, todas responden',{});
  const hs=a.m2.map(x=>x.h).sort((x,y)=>x-y).join(',');
  console.log(hs==='360,480,1080'?'OK alturas 360,480,1080':'FALLO alturas '+hs, a.m2.some(x=>/ABORTED/.test(x.url))?'FALLO usó carga abortada':'OK ignora cargas abortadas');
  const b=await scenario('Bunny: el 480p no cambia el video',{noChange:[480]});
  const hs2=b.m2.map(x=>x.h).sort((x,y)=>x-y).join(',');
  console.log(hs2==='360,1080'?'OK alturas 360,1080 (480 sin URL propia)':'FALLO alturas '+hs2);
})();
