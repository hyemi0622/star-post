/* STAR POST */
const $=s=>document.querySelector(s);
const R=Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const S={lat:37.5665,lon:126.978,place:'',placeEn:'',mode:'wait',off:0,az:0,alt:40,cur:null,stamps:store.get('sp_stamps2',[]),camOn:false,fov:64,cap:1};
const IMG={};['stamp','seal','postcard','stampbtn'].forEach(k=>{const i=new Image();i.src=`img/${k}.${k==='postcard'?'jpg':'png'}`;IMG[k]=i});

/* ---- 카카오톡 인앱 확대 방지 ---- */
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
let lastT=0;document.addEventListener('touchend',e=>{const t=Date.now();if(t-lastT<300&&!e.target.closest('input'))e.preventDefault();lastT=t},{passive:false});
let HS=844,K=1,mSc=1,mTop=166;
function setScale(){const w=window.visualViewport?.width||document.documentElement.clientWidth||innerWidth,vh=window.visualViewport?.height||innerHeight;K=Math.min(1.25,w/390);HS=vh/K;const app=document.getElementById('app');app.style.setProperty('--k',K.toFixed(4));app.style.setProperty('--hs',Math.ceil(HS)+'px');layoutMachine()}
function resetZoom(){const vv=window.visualViewport;if(vv&&vv.scale>1.01){const m=document.querySelector('meta[name=viewport]'),o=m.content;m.content=o+', maximum-scale=1.0';setTimeout(()=>m.content=o,60)}}
/* zoom 적용 요소의 화면 좌표 (브라우저별 getBoundingClientRect 차이 보정) */
function vrect(el){const r=el.getBoundingClientRect(),st=el.closest('.stage').getBoundingClientRect(),z=Math.abs(st.width-390)<1&&K!==1?K:1;return{left:r.left*z,top:r.top*z,width:r.width*z,height:r.height*z}}
function layoutMachine(){const m=document.getElementById('machine'),sky=document.getElementById('sky');if(!m)return;let top=166,sc=1,short=false;const cardTop=HS-197;if(top+404>cardTop){top=Math.max(96,cardTop-404);if(top+404>cardTop){short=true;top=96;sc=Math.min(1,(HS-80-8-top)/404)}}m.style.top=top+'px';m.style.transform=`scale(${sc.toFixed(3)})`;mSc=sc;mTop=top;sky.classList.toggle('mshort',short)}
setScale();[50,150,400,800,1500,3000].forEach(t=>setTimeout(setScale,t));addEventListener('resize',setScale);addEventListener('orientationchange',()=>setTimeout(setScale,250));addEventListener('pageshow',setScale);addEventListener('load',setScale);window.visualViewport?.addEventListener('resize',setScale);window.visualViewport?.addEventListener('scroll',resetZoom);
document.addEventListener('touchmove',e=>{if(e.touches.length>1&&!e.target.closest('#sky'))e.preventDefault()},{passive:false});
/* 기계 창(구멍) 위치: 296x396 기준 */
const HOLE={x:95.5,y:117.75,w:110.5,h:162.75};
function holeRect(){const sl=(innerWidth-390*K)/2;return{left:sl+(47+148+(HOLE.x-148)*mSc)*K,top:(mTop+HOLE.y*mSc)*K,width:HOLE.w*mSc*K,height:HOLE.h*mSc*K}}
/* ---- 별 스프라이트 ---- */
const COLS=[[165,195,255],[210,225,255],[255,250,240],[255,232,190],[255,200,150]];
const SPR=COLS.map(c=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,`rgba(${c},1)`);gr.addColorStop(.35,`rgba(${c},.35)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,64,64);return cv});
const colIdx=bv=>bv<0?0:bv<.4?1:bv<.8?2:bv<1.3?3:4;
function drawStar(g,x,y,mag,ci,t,ph){const tw=.8+.2*Math.sin(t*(1.7+ph*3)+ph*40)+(Math.random()-.5)*(mag<3?.14:.06);
 const r=clamp(4.4-mag*.78,.8,5.2)*(0.95+tw*.1),a=clamp(1.15-mag*.14,.3,1)*tw;g.globalAlpha=a;const s=r*5;g.drawImage(SPR[ci],x-s/2,y-s/2,s,s);
 g.globalAlpha=Math.min(1,a*1.2);g.fillStyle='#fff';g.beginPath();g.arc(x,y,r*.32,0,6.283);g.fill();
 if(mag<1.6){g.globalAlpha=a*.22;g.strokeStyle='#fff';g.lineWidth=.5;const L=r*4.5;g.beginPath();g.moveTo(x-L,y);g.lineTo(x+L,y);g.moveTo(x,y-L);g.lineTo(x,y+L);g.stroke()}}
/* ---- 천문 계산 ---- */
function jd(d){return d/864e5+2440587.5}
function lst(d,lon){const t=jd(d)-2451545;return((280.46061837+360.98564736629*t+lon)%360+360)%360}
function sunRD(d){const t=jd(d)-2451545,L=(280.46+.9856474*t)%360,g=(357.528+.9856003*t)*R,lam=(L+1.915*Math.sin(g)+.02*Math.sin(2*g))*R,e=(23.439-4e-7*t)*R;return[Math.atan2(Math.cos(e)*Math.sin(lam),Math.cos(lam))/R,Math.asin(Math.sin(e)*Math.sin(lam))/R]}
function enu(ra,dec,LST,lat){const H=(LST-ra)*R,d=dec*R,p=lat*R,sa=Math.sin(d)*Math.sin(p)+Math.cos(d)*Math.cos(p)*Math.cos(H),alt=Math.asin(sa),az=Math.atan2(-Math.sin(H)*Math.cos(d),Math.sin(d)*Math.cos(p)-Math.cos(d)*Math.sin(p)*Math.cos(H)),ca=Math.cos(alt);return[ca*Math.sin(az),ca*Math.cos(az),sa]}
const STARS=SKY.stars.map((s,i)=>({ra:(s[0]+360)%360,dec:s[1],mag:s[2],ci:colIdx(s[3]),ph:(i*.618)%1,v:[0,0,0]}));
const CONS=SKY.cons.map(c=>({id:c.id,ko:c.ko,la:c.la,ra:(c.ra+360)%360,dec:c.dec,lines:c.lines.map(l=>l.map(p=>({ra:(p[0]+360)%360,dec:p[1],v:[0,0,0]}))),v:[0,0,0]}));
const conById=id=>CONS.find(c=>c.id===id);
let sunAlt=0,lastAstro=0;
function updAstro(){const d=Date.now();if(d-lastAstro<1000)return;lastAstro=d;const L=lst(d,S.lon);for(const s of STARS)s.v=enu(s.ra,s.dec,L,S.lat);for(const c of CONS){c.v=enu(c.ra,c.dec,L,S.lat);for(const l of c.lines)for(const p of l)p.v=enu(p.ra,p.dec,L,S.lat)}
 const[sr,sd]=sunRD(d);sunAlt=Math.asin(enu(sr,sd,L,S.lat)[2])/R;const day=sunAlt>-4;$('#skyBg').classList.toggle('day',day);$('#tint').classList.toggle('day',day)}

/* ---- 방향 ---- */
function rotM(a,b,g){a*=R;b*=R;g*=R;const cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);return[cA*cG-sA*sB*sG,-sA*cB,cA*sG+sA*sB*cG,sA*cG+cA*sB*sG,cA*cB,sA*sG-cA*sB*cG,-cB*sG,sB,cB*cG]}
let Rt=rotM(0,90,0),Rs=Rt.slice();
let aOff=null;const wrap180=d=>((d+540)%360)-180;
function onOri(e){if(e.alpha==null)return;let a=e.alpha;
 if(e.webkitCompassHeading!=null&&e.webkitCompassHeading>=0){const tgt=wrap180(360-e.webkitCompassHeading-e.alpha);if(aOff==null)aOff=tgt;else if(Math.abs(e.beta)<55&&Math.abs(e.gamma)<45)aOff+=wrap180(tgt-aOff)*.04;a=e.alpha+aOff}
 Rt=rotM(a+S.off,e.beta,e.gamma);if(S.mode!=='sensor'){S.mode='sensor';$('#sensorBtn').hidden=true;$('#hint').classList.add('off')}}
function setManual(){if(S.mode==='sensor')return;S.mode='manual';Rt=rotM(-S.az,90+S.alt,0);$('#hint').textContent='화면을 드래그해서 하늘을 둘러보세요';$('#hint').classList.remove('off');if(window.DeviceOrientationEvent?.requestPermission)$('#sensorBtn').hidden=false}
let sensorsInit=false;
function initSensors(){if(sensorsInit)return;sensorsInit=true;let abs=false;if('ondeviceorientationabsolute' in window)addEventListener('deviceorientationabsolute',e=>{if(e.alpha!=null){abs=true;onOri(e)}});
 addEventListener('deviceorientation',e=>{if(!abs)onOri(e)});setTimeout(()=>{if(S.mode==='wait')setManual()},2500);setTimeout(()=>$('#hint').classList.add('off'),8000)}
async function askSensor(){try{if(window.DeviceOrientationEvent?.requestPermission){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')setManual()}}catch(e){setManual()}initSensors()}
$('#sensorBtn').onclick=askSensor;
function smoothR(){for(let i=0;i<9;i++)Rs[i]+=(Rt[i]-Rs[i])*.1;const c=[[Rs[0],Rs[3],Rs[6]],[Rs[1],Rs[4],Rs[7]]];const n=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)};let x=n(c[0]),y=c[1],d=x[0]*y[0]+x[1]*y[1]+x[2]*y[2];y=n([y[0]-d*x[0],y[1]-d*x[1],y[2]-d*x[2]]);const z=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];Rs=[x[0],y[0],z[0],x[1],y[1],z[1],x[2],y[2],z[2]]}
/* 드래그(둘러보기/방위 보정) + 핀치 줌 */
(function(){const cv=$('#stars');let px,py,on=false,pinch=null;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 cv.addEventListener('pointerdown',e=>{on=true;px=e.clientX;py=e.clientY});cv.addEventListener('pointermove',e=>{if(!on||pinch)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;if(S.mode==='manual'){S.az=(S.az-dx*.25*S.fov/64+360)%360;S.alt=clamp(S.alt+dy*.25*S.fov/64,-10,90);Rt=rotM(-S.az,90+S.alt,0)}else S.off-=dx*.15});addEventListener('pointerup',()=>on=false);
 const sky=$('#sky');sky.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch={d:dist(e.touches),f:S.fov,c:S.cap};on=false}},{passive:true});
 sky.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){e.preventDefault();const q=pinch.d/dist(e.touches);if(!$('#machine').hidden)setCap(pinch.c*q);else setFov(pinch.f*q)}},{passive:false});
 sky.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null});
 sky.addEventListener('wheel',e=>{e.preventDefault();const q=1+e.deltaY*.002;if(!$('#machine').hidden)setCap(S.cap*q);else setFov(S.fov*q)},{passive:false})})();
function setFov(f){S.fov=clamp(f,18,64);F=(H/2)/Math.tan(S.fov/2*R);const z=Math.tan(32*R)/Math.tan(S.fov/2*R);$('#cam').style.transform=`scale(${z.toFixed(3)})`}
/* 기계 창 안에서만 축소(카메라 화면은 그대로, 창에 더 넓은 영역을 담음) */
function capMax(){const r=holeRect();return Math.max(1,Math.min(W/r.width,H/r.height))}
function setCap(v){S.cap=clamp(v,1,capMax())}
$('#zOut').onclick=()=>setCap(S.cap*1.2);$('#zIn').onclick=()=>setCap(S.cap/1.2);

/* ---- 렌더 ---- */
const cv=$('#stars'),g=cv.getContext('2d');let W,H,dpr=1,F,fc=0;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(dpr,0,0,dpr,0,0);setFov(S.fov)}
resize();addEventListener('resize',resize);
function proj(v){const x=Rs[0]*v[0]+Rs[3]*v[1]+Rs[6]*v[2],y=Rs[1]*v[0]+Rs[4]*v[1]+Rs[7]*v[2],z=Rs[2]*v[0]+Rs[5]*v[1]+Rs[8]*v[2];if(z>-.08)return null;return[W/2+F*x/-z,H/2-F*y/-z]}
const DIRS=['북','북동','동','남동','남','남서','서','북서'];
function frame(ts){if(!$('#sky').classList.contains('show')){requestAnimationFrame(frame);return}updAstro();smoothR();const t=ts/1000;g.clearRect(0,0,W,H);
 const mOpen=!$('#machine').hidden;let cx=W/2,cy=H/2;if(mOpen){const r=holeRect();cx=r.left+r.width/2;cy=r.top+r.height/2}const rad=Math.min(W,H)*.38;let best=null,bd=1e9;
 for(const c of CONS){const p=proj(c.v);const vis=c.lines.some(l=>l.some(q=>{const pp=proj(q.v);return pp&&pp[0]>0&&pp[0]<W&&pp[1]>0&&pp[1]<H}));if(!vis)continue;if(p){const d=Math.hypot(p[0]-cx,p[1]-cy);if(d<(S.cur===c?rad*1.25:rad)&&d<bd){bd=d;best=c}}
  const sel=S.cur===c;g.lineWidth=sel?1.6:.8;g.strokeStyle=sel?'rgba(190,215,255,.9)':'rgba(150,170,220,.28)';g.beginPath();for(const l of c.lines){let prev=null;for(const q of l){const pp=proj(q.v);if(pp&&prev&&Math.hypot(pp[0]-prev[0],pp[1]-prev[1])<W*1.5){g.moveTo(prev[0],prev[1]);g.lineTo(pp[0],pp[1])}prev=pp}}g.stroke()}
 if(best!==S.cur){S.cur=best;showCon(best)}
 g.globalCompositeOperation='lighter';for(const s of STARS){if(s.v[2]<-.02)continue;const p=proj(s.v);if(!p||p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)continue;drawStar(g,p[0],p[1],s.mag,s.ci,t,s.ph)}g.globalCompositeOperation='source-over';g.globalAlpha=1;
 const cxw=-Rs[2],cyw=-Rs[5],czw=-Rs[8],az=(Math.atan2(cxw,cyw)/R+360)%360,alt=Math.asin(clamp(czw,-1,1))/R;
 if((fc++)%12===0)$('#hudDir').textContent=`${DIRS[Math.round(az/45)%8]} ${az.toFixed(0)}° · 고도 ${alt.toFixed(0)}°${S.mode==='manual'?' · 수동':''}${S.fov!==64?` · ${(64/S.fov).toFixed(1)}x`:''}`;
 if(!$('#machine').hidden)drawPreview();
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* ---- 별자리 설명 ---- */
const DESC={Ori:'겨울 밤하늘의 왕. 허리띠 세 별과 붉은 베텔게우스, 푸른 리겔이 사냥꾼의 모습을 그려요.',UMa:'북두칠성이 들어 있는 큰곰자리. 국자 끝 두 별을 이으면 북극성을 찾을 수 있어요.',UMi:'북극성이 꼬리 끝에 있는 작은곰자리. 밤새 거의 움직이지 않는 하늘의 중심이에요.',Cas:'W자 모양의 카시오페이아. 사계절 내내 북쪽 하늘에서 볼 수 있어요.',Cyg:'여름 은하수 위를 나는 백조. 십자 모양이라 북십자성이라고도 불러요.',Lyr:'거문고자리. 여름 대삼각형의 꼭짓점인 직녀성(베가)이 반짝여요.',Aql:'독수리자리. 견우성(알타이르)이 은하수 건너 직녀를 바라보고 있어요.',Sco:'붉은 심장 안타레스를 가진 전갈. 여름 남쪽 하늘에 S자로 누워 있어요.',Sgr:'궁수자리. 우리 은하 중심 방향이라 은하수가 가장 진하게 보이는 곳이에요.',Leo:'봄의 사자자리. 물음표를 뒤집은 모양의 머리와 밝은 레굴루스가 특징이에요.',Gem:'쌍둥이자리. 카스토르와 폴룩스 두 별이 나란히 형제처럼 빛나요.',Tau:'황소자리. 붉은 눈 알데바란과 작은 국자 같은 플레이아데스 성단이 있어요.',CMa:'큰개자리. 밤하늘에서 가장 밝은 별 시리우스가 오리온을 따라다녀요.',CMi:'작은개자리. 밝은 프로키온이 겨울 대삼각형을 만들어요.',Boo:'목동자리. 주황빛 아르크투루스는 봄 밤하늘에서 가장 밝은 별이에요.',Vir:'처녀자리. 봄의 대곡선 끝에 하얀 스피카가 놓여 있어요.',And:'안드로메다자리. 맨눈으로 보이는 가장 먼 천체, 안드로메다 은하가 여기 있어요.',Per:'페르세우스자리. 변광성 알골이 "악마의 별"이라 불리며 깜박여요.',Peg:'가을 밤의 페가수스. 큰 사각형이 하늘을 나는 말의 몸통이에요.',Cnc:'게자리. 희미하지만 가운데에 벌집 성단(프레세페)이 숨어 있어요.',Aur:'마차부자리. 오각형 꼭대기에 노란 카펠라가 빛나요.',Dra:'용자리. 큰곰과 작은곰 사이를 길게 굽이치며 지나가요.',Her:'헤르쿨레스자리. 밝은 별은 없지만 구상성단 M13이 유명해요.',CrB:'북쪽왕관자리. 작은 반원이 정말 왕관처럼 보여요.',Cep:'세페우스자리. 집 모양의 다섯 별이 카시오페이아 옆에 있어요.',Ari:'양자리. 봄의 시작을 알리던 황도 12궁의 첫 번째 별자리예요.',Aqr:'물병자리. 가을 남쪽 하늘에 물을 쏟는 모습으로 길게 펼쳐져 있어요.',Psc:'물고기자리. 끈으로 묶인 두 마리 물고기가 페가수스 아래에 있어요.',Lib:'천칭자리. 전갈의 집게였던 두 별이 저울이 되었어요.',Cap:'염소자리. 삼각형 모양의 바다염소가 가을 초저녁 남쪽에 떠요.',Cru:'남십자자리. 남반구의 상징으로 우리나라에서는 보기 어려워요.',Oph:'뱀주인자리. 여름 남쪽 하늘에 커다란 집 모양으로 서 있어요.',Crv:'까마귀자리. 작은 사다리꼴 네 별이 봄 남쪽 하늘에 떠요.',Del:'돌고래자리. 작고 앙증맞은 마름모가 은하수 옆에서 뛰어올라요.',Lep:'토끼자리. 오리온 발밑에서 사냥개를 피해 웅크리고 있어요.',Eri:'에리다누스자리. 리겔 옆에서 시작해 남쪽으로 길게 흐르는 강이에요.'};
function season(ra){const m=(Math.round(9+ra/30)%12)+1;return m>=3&&m<=5?'봄':m>=6&&m<=8?'여름':m>=9&&m<=11?'가을':'겨울'}
function showCon(c){const el=$('#conInfo');if(!c){el.classList.remove('show');return}el.querySelector('.con-name').textContent=c.ko;el.querySelector('.con-id').textContent=c.id;el.querySelector('.con-desc').textContent=DESC[c.id]||`${c.ko}. ${season(c.ra)} 밤하늘에서 가장 잘 보이는 별자리예요.`;el.classList.add('show')}

/* ---- 권한 & 시작 ---- */
async function startCam(){try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});const v=$('#cam');v.srcObject=st;v.classList.add('on');S.camOn=true;$('#tint').classList.add('cam');await v.play().catch(()=>{})}catch(e){S.camOn=false}}
async function geocode(){const q=l=>fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${S.lat}&lon=${S.lon}&zoom=10&accept-language=${l}`).then(r=>r.json()).then(j=>{const a=j.address||{};return a.city||a.town||a.county||a.province||a.state||j.display_name.split(',')[0]});
 try{S.place=await q('ko');S.placeEn=await q('en').catch(()=>S.place)}catch(e){S.place=S.placeEn=`${S.lat.toFixed(2)}, ${S.lon.toFixed(2)}`}$('#hudPlace').textContent=S.place;if(!$('#pcWhere').value)$('#pcWhere').value=S.place}
$('#startBtn').onclick=async()=>{await askSensor();startCam();$('#onboard').classList.remove('show');$('#sky').classList.add('show');renderMini();
 if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{S.lat=p.coords.latitude;S.lon=p.coords.longitude;lastAstro=0;geocode()},()=>{S.place='서울';S.placeEn='Seoul';$('#hudPlace').textContent='위치 없음 · 서울 기준'},{timeout:8000,maximumAge:6e5});else geocode()};

/* ---- 스탬프 기계 & 우표 생성 ---- */
$('#stampBtn').onclick=()=>{if(S.stamps.length>=6)return alert('엽서에는 우표를 6장까지 붙일 수 있어요. 엽서에서 우표를 떼어 주세요.');$('#machine').hidden=false;$('#sky').classList.add('mopen');layoutMachine();S.cap=1;$('#hint').classList.add('off')};
$('#mClose').onclick=()=>{$('#machine').hidden=true;$('#sky').classList.remove('mopen')};
let pending=null;
const enDate=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
$('#pressBtn').onclick=()=>{const m=$('#machine');m.classList.add('press');m.classList.remove('flash');void m.offsetWidth;m.classList.add('flash');
 setTimeout(()=>{m.classList.remove('press');const img=makeStamp();pending={img,con:S.cur?S.cur.id:'',ko:S.cur?S.cur.ko:'하늘',date:Date.now(),place:S.place};$('#nImg').src=img;$('#nName').value='';$('#nDate').textContent=`${enDate(pending.date)} - ${S.placeEn||S.place||'Seoul'}`;m.hidden=true;$('#sky').classList.remove('mopen');$('#naming').classList.add('show')},380)};
/* 창 영역(cap 배 확대 영역)의 카메라+별 합성 */
function drawComposite(o,Wi,Hi){const h=holeRect(),f=S.cap,cx=h.left+h.width/2,cy=h.top+h.height/2,r={left:cx-h.width*f/2,top:cy-h.height*f/2,width:h.width*f,height:h.height*f};
 const gr=o.createLinearGradient(0,0,0,Hi);gr.addColorStop(0,'#070b1e');gr.addColorStop(1,'#182450');o.fillStyle=gr;o.fillRect(0,0,Wi,Hi);
 if(S.camOn){try{const v=$('#cam'),vw=v.videoWidth,vh=v.videoHeight;if(vw){const z=Math.tan(32*R)/Math.tan(S.fov/2*R),sc=Math.max(W/vw,H/vh)*z,sx=(r.left-W/2)/sc+vw/2,sy=(r.top-H/2)/sc+vh/2,sw=r.width/sc,sh=r.height/sc;const x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(vw,sx+sw),y1=Math.min(vh,sy+sh);if(x1>x0&&y1>y0)o.drawImage(v,x0,y0,x1-x0,y1-y0,(x0-sx)/sw*Wi,(y0-sy)/sh*Hi,(x1-x0)/sw*Wi,(y1-y0)/sh*Hi)}}catch(e){}}
 const sx=r.left*dpr,sy=r.top*dpr,sw=r.width*dpr,sh=r.height*dpr,x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(cv.width,sx+sw),y1=Math.min(cv.height,sy+sh);if(x1>x0&&y1>y0)o.drawImage(cv,x0,y0,x1-x0,y1-y0,(x0-sx)/sw*Wi,(y0-sy)/sh*Hi,(x1-x0)/sw*Wi,(y1-y0)/sh*Hi);return r}
const mpv=$('#mPrev'),mpg=mpv.getContext('2d');
function drawPreview(){const h=holeRect(),pw=Math.round(h.width*dpr),ph=Math.round(h.height*dpr);if(mpv.width!==pw||mpv.height!==ph){mpv.width=pw;mpv.height=ph}drawComposite(mpg,pw,ph)}
/* 창 안의 화면을 우표(img/stamp.png) 모양 그대로 잘라냄 */
function makeStamp(){const k=2,Wi=225*k,Hi=327*k,out=document.createElement('canvas');out.width=Wi;out.height=Hi;const o=out.getContext('2d');const r=drawComposite(o,Wi,Hi);
 if(S.cur){const mp=p=>[(p[0]-r.left)/r.width*Wi,(p[1]-r.top)/r.height*Hi];o.strokeStyle='rgba(220,235,255,.95)';o.lineWidth=1.6*k;o.lineCap='round';o.beginPath();const pts=[];for(const l of S.cur.lines){let prev=null;for(const q of l){const pp=proj(q.v);if(pp){const w=mp(pp);pts.push(w);if(prev){o.moveTo(prev[0],prev[1]);o.lineTo(w[0],w[1])}prev=w}else prev=null}}o.stroke();o.globalCompositeOperation='lighter';for(const w of pts)drawStar(o,w[0],w[1],1.2,2,0,.5);o.globalCompositeOperation='source-over';o.globalAlpha=1}
 o.globalCompositeOperation='destination-in';o.drawImage(IMG.stamp,0,0,Wi,Hi);o.globalCompositeOperation='multiply';o.globalAlpha=.35;o.drawImage(IMG.stamp,0,0,Wi,Hi);o.globalCompositeOperation='source-over';o.globalAlpha=1;
 return out.toDataURL('image/png')}
$('#nClose').onclick=()=>$('#naming').classList.remove('show');
function stampWithText(src,con,name,cb){const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const o=c.getContext('2d'),k=im.width/225;o.drawImage(im,0,0);
 o.save();o.globalCompositeOperation='source-atop';o.textAlign='center';o.shadowColor='rgba(0,0,0,.7)';o.shadowBlur=4*k;o.fillStyle='#fff';
 o.font=`700 ${22*k}px "Apple SD Gothic Neo","Noto Sans KR",Inter,sans-serif`;o.fillText(name,c.width/2,c.height-40*k,190*k);
 o.font=`500 ${15*k}px "Apple SD Gothic Neo","Noto Sans KR",Inter,sans-serif`;o.globalAlpha=.92;o.fillText(con,c.width/2,c.height-20*k,190*k);o.restore();cb(c.toDataURL('image/png'))};im.src=src}
$('#nSave').onclick=()=>{if(!pending)return;const nm=$('#nName').value.trim();stampWithText(pending.img,pending.ko,nm||pending.ko,img=>{pending.img=img;saveStamp(nm)})};
function saveStamp(nm){pending.name=nm||pending.ko;const sl=SLOTS[S.stamps.length]||SLOTS[5];pending.x=sl[0];pending.y=sl[1];pending.rot=sl[2];S.stamps.push(pending);if(!store.set('sp_stamps2',S.stamps))alert('저장 공간이 가득 찼어요. 엽서를 이미지로 저장한 뒤 우표를 몇 개 떼어 주세요.');pending=null;$('#naming').classList.remove('show');renderMini();openPost()};

/* 엽서 만들기 카드의 미니 우표 (시안 좌표: 카드 기준 108,730) */
const MINI=[[186,748.42,9.61],[205,743.62,9.61],[229,756.1,-1.39],[256.57,743,1.71],[271.24,758.01,-1.85],[287.59,745.79,16.49]];
function renderMini(){const box=$('#miniStamps');box.innerHTML='';MINI.forEach((m,i)=>{const s=S.stamps[i];if(!s)return;const im=new Image();im.src=s.img;im.style.cssText=`left:${m[0]-108}px;top:${m[1]-730}px;transform:rotate(${m[2]}deg)`;box.appendChild(im)})}

/* ---- 엽서 (캔버스, 300x449 시안 좌표) ---- */
const PC=store.get('sp_pc',{});$('#pcWith').value=PC.with||'';$('#pcWhere').value=PC.where||'';$('#pcMsg').value=PC.msg||'';
const fmt=d=>{const x=new Date(d);return `${x.getFullYear()}. ${x.getMonth()+1}. ${x.getDate()}`};
function dateText(){const ds=S.stamps.map(s=>s.date);if(!ds.length)return fmt(Date.now());const a=fmt(Math.min(...ds)),b=fmt(Math.max(...ds));return a===b?a:a+' ~ '+b}
['#pcWith','#pcWhere','#pcMsg'].forEach(s=>$(s).addEventListener('input',()=>{store.set('sp_pc',{with:$('#pcWith').value,where:$('#pcWhere').value,msg:$('#pcMsg').value});renderCard()}));
const imgCache={};function getImg(src){if(!imgCache[src]){const i=new Image();i.src=src;i.onload=renderCard;imgCache[src]=i}return imgCache[src]}
const pcc=$('#pcCanvas'),pg=pcc.getContext('2d');
/* 우표 슬롯: 시안의 6개 우표 위치(화면 좌표)를 엽서(45,128) 기준으로 변환한 중심점 */
const SLOTS=[[82,44,90],[210,44,97.14],[82,112,90],[210,112,90],[82,180,90],[210,180,83.23]];
function vtext(o,txt,x,y,font,color,maxW){o.save();o.translate(x,y);o.rotate(Math.PI/2);o.font=font;o.fillStyle=color;o.textBaseline='alphabetic';if(maxW)o.fillText(txt,0,0,maxW);else o.fillText(txt,0,0);o.restore()}
function wrap(o,txt,font,maxW,maxLines){o.font=font;const lines=[];let cur='';for(const ch of txt){const t=cur+ch;if(o.measureText(t).width>maxW&&cur){lines.push(cur);cur=ch}else cur=t}if(cur)lines.push(cur);return lines.slice(0,maxLines)}
let selIdx=-1;
S.stamps.forEach((s,i)=>{if(s.x==null){const sl=SLOTS[i]||SLOTS[5];s.x=sl[0];s.y=sl[1];s.rot=sl[2]}});
const GO='"Apple SD Gothic Neo","Noto Sans KR",Inter,sans-serif';
function renderCard(exp){const k=3,CW=300,CH=449;pcc.width=CW*k;pcc.height=CH*k;const o=pg;o.setTransform(k,0,0,k,0,0);
 if(IMG.postcard.complete&&IMG.postcard.naturalWidth)o.drawImage(IMG.postcard,0,0,CW,CH);else{o.fillStyle='#d9cbaa';o.fillRect(0,0,CW,CH);IMG.postcard.onload=()=>renderCard()}
 const ink='#1f2a44';
 const w=$('#pcWith').value.trim();if(w)vtext(o,w,30,56,`500 11px ${GO}`,ink,64);
 const lines=wrap(o,$('#pcMsg').value,`11px ${GO}`,140,3);lines.forEach((t,i)=>vtext(o,t,91.5+i*25,260,`11px ${GO}`,ink));
 const at=$('#pcWhere').value.trim(),on=dateText();vtext(o,`at ${at||'-'}  ·  on ${on}`,166.5,260,`9px ${GO}`,ink,140);
 if(S.stamps.length&&IMG.seal.complete){o.save();o.globalAlpha=.9;o.translate(249.5,401);o.rotate(8*R);o.drawImage(IMG.seal,-26,-26,52,51);o.restore()}
 S.stamps.forEach((s,i)=>{const im=getImg(s.img),c=s.sc||1;if(!(im.complete&&im.naturalWidth))return;o.save();o.translate(s.x,s.y);o.rotate(s.rot*R);o.shadowColor='rgba(0,0,0,.25)';o.shadowBlur=3;o.shadowOffsetY=1;o.drawImage(im,-29*c,-42*c,58*c,84*c);o.restore();
  if(!exp&&i===selIdx){const hw=44*c,hh=31*c;o.save();o.strokeStyle='rgba(39,39,39,.9)';o.lineWidth=1;o.setLineDash([3,2]);o.strokeRect(s.x-hw,s.y-hh,hw*2,hh*2);o.setLineDash([]);
   o.fillStyle='#272727';o.beginPath();o.arc(s.x-hw,s.y-hh,9,0,7);o.fill();o.strokeStyle='#fff';o.lineWidth=1.6;o.beginPath();o.moveTo(s.x-hw-4,s.y-hh-4);o.lineTo(s.x-hw+4,s.y-hh+4);o.moveTo(s.x-hw+4,s.y-hh-4);o.lineTo(s.x-hw-4,s.y-hh+4);o.stroke();
   o.fillStyle='#fff';o.beginPath();o.arc(s.x+hw,s.y+hh,9,0,7);o.fill();o.strokeStyle='#272727';o.lineWidth=1.2;o.stroke();o.beginPath();o.moveTo(s.x+hw-4,s.y+hh+4);o.lineTo(s.x+hw+4,s.y+hh-4);o.moveTo(s.x+hw+1,s.y+hh-4);o.lineTo(s.x+hw+4,s.y+hh-4);o.lineTo(s.x+hw+4,s.y+hh-1);o.moveTo(s.x+hw-4,s.y+hh+1);o.lineTo(s.x+hw-4,s.y+hh+4);o.lineTo(s.x+hw-1,s.y+hh+4);o.stroke();o.restore()}})}
function openPost(){$('#pcDate').textContent=dateText();$('#sky').classList.remove('show');$('#postcard').classList.add('show');selIdx=-1;renderCard()}
$('#postBtn').onclick=openPost;$('#pcBack').onclick=()=>{$('#postcard').classList.remove('show');$('#sky').classList.add('show');renderMini()};
/* 우표 탭=선택(좌상단 X 삭제, 우하단 손잡이 크기), 드래그=이동, 두 손가락=크기, 빈 곳 탭=글쓰기 */
(function(){let drag=null,moved=false,pinch=null;const pos=e=>{const b=vrect(pcc);return[(e.clientX-b.left)/b.width*300,(e.clientY-b.top)/b.height*449]};
 const hit=(x,y)=>{for(let i=S.stamps.length-1;i>=0;i--){const s=S.stamps[i],c=s.sc||1;if(Math.abs(x-s.x)<42*c&&Math.abs(y-s.y)<29*c)return i}return -1};
 const save=()=>store.set('sp_stamps2',S.stamps);const setSc=(s,v)=>{s.sc=clamp(v,.5,2.4)};
 pcc.addEventListener('pointerdown',e=>{if(pinch)return;const[x,y]=pos(e);moved=false;
  if(selIdx>=0){const s=S.stamps[selIdx],c=s.sc||1,hw=44*c,hh=31*c;if(Math.hypot(x-(s.x-hw),y-(s.y-hh))<14){S.stamps.splice(selIdx,1);selIdx=-1;save();$('#pcDate').textContent=dateText();renderCard();drag=null;return}
   if(Math.hypot(x-(s.x+hw),y-(s.y+hh))<14){drag={i:selIdx,mode:'scale',d0:Math.hypot(x-s.x,y-s.y),s0:c};pcc.setPointerCapture(e.pointerId);return}}
  const i=hit(x,y);if(i>=0){selIdx=i;drag={i,mode:'move',dx:S.stamps[i].x-x,dy:S.stamps[i].y-y};pcc.setPointerCapture(e.pointerId)}else{selIdx=-1;drag=null;$('#sheet').hidden=false;$('#pcMsg').focus()}renderCard()});
 pcc.addEventListener('pointermove',e=>{if(!drag||pinch)return;const[x,y]=pos(e),s=S.stamps[drag.i];if(!s)return;
  if(drag.mode==='scale'){setSc(s,drag.s0*Math.hypot(x-s.x,y-s.y)/Math.max(1,drag.d0));moved=true}
  else{const c=s.sc||1,nx=clamp(x+drag.dx,30*c,300-30*c),ny=clamp(y+drag.dy,20*c,449-20*c);if(Math.hypot(nx-s.x,ny-s.y)>1)moved=true;s.x=nx;s.y=ny}renderCard()});
 const up=()=>{if(drag&&moved)save();drag=null};pcc.addEventListener('pointerup',up);pcc.addEventListener('pointercancel',up);pcc.addEventListener('contextmenu',e=>e.preventDefault());
 const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 pcc.addEventListener('touchstart',e=>{if(e.touches.length===2&&selIdx>=0){pinch={d:dist(e.touches),s0:S.stamps[selIdx].sc||1};drag=null}},{passive:true});
 pcc.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2&&selIdx>=0){e.preventDefault();setSc(S.stamps[selIdx],pinch.s0*dist(e.touches)/pinch.d);renderCard()}},{passive:false});
 pcc.addEventListener('touchend',e=>{if(pinch&&e.touches.length<2){pinch=null;save()}});
 $('#sheetDone').onclick=()=>{$('#sheet').hidden=true}})();
$('#pcSave').onclick=()=>{$('#sheet').hidden=true;selIdx=-1;renderCard(true);$('#pvImg').src=pcc.toDataURL('image/png');$('#preview').classList.add('show')};
$('#pvClose').onclick=()=>$('#preview').classList.remove('show');
renderMini();
