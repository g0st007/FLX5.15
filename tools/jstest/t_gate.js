const {makeEnv,vm,fs}=require('./harness.js');
const js=fs.readFileSync('SNIFF_JS.js','utf8');
async function run(name,scn,expect){
  const {ctx,calls}=makeEnv(scn);
  vm.createContext(ctx);
  try{vm.runInContext(js,ctx);}catch(e){console.log(name,'ERROR al cargar:',e.message);return;}
  const h=ctx.__fluxHarvest; if(typeof h!=='function'){console.log(name,'sin __fluxHarvest');return;}
  await h(); await new Promise(r=>setTimeout(r,300));
  const names=calls.map(c=>c[0]+(c[0]==='note'?':'+c[1]:''));
  const auto=calls.filter(c=>c[0]==='auto').map(c=>c[1]);
  console.log(name,'| auto:',JSON.stringify(auto),'| notas:',calls.filter(c=>c[0]==='note').map(c=>c[1]).join(' / ')||'(ninguna)','| harvested=',ctx.__fluxHarvested);
  expect(calls,ctx);
}
const rect={left:0,top:0,right:360,bottom:200,width:360,height:200};
function vid(src){return {tagName:'VIDEO',currentSrc:src,src,_r:rect,getBoundingClientRect(){return rect},paused:true,ended:false,muted:false,duration:600,videoHeight:720,play(){return Promise.resolve()},pause(){},load(){},parentElement:null,className:'',id:'',getAttribute(){return null}};}
(async()=>{
  // PH: el video usa MSE (blob:)
  await run('PH blob',{url:'https://es.pornhub.com/view_video.php?viewkey=1',video:vid('blob:https://es.pornhub.com/abc')},(c)=>{
    if(c.some(x=>x[0]==='auto'||x[0]==='note'))console.log('  FALLO: no debía hacer nada'); else console.log('  OK: no hace nada');});
  await run('PH m3u8',{url:'https://x.com/v',video:vid('https://cdn.x.com/master.m3u8?a=1')},(c)=>{
    if(c.some(x=>x[0]==='auto'||x[0]==='note'))console.log('  FALLO'); else console.log('  OK: no hace nada');});
  await run('sin src aún',{url:'https://x.com/v',video:vid('')},(c,ctx)=>{
    if(c.some(x=>x[0]==='auto'||x[0]==='note')||ctx.__fluxHarvested)console.log('  FALLO'); else console.log('  OK: espera (no consume intento)');});
  await run('Bunny mp4 sin menú',{url:'https://pimpbunny.com/videos/x/',video:vid('https://pimpbunny.com/get_file/9/h/1/2/x_720p.mp4/')},(c)=>{
    if(c.some(x=>x[0]==='note'&&/no se encontró el menú/.test(x[1])))console.log('  OK: intenta y avisa que no hay menú'); else console.log('  FALLO inesperado');});
})();
