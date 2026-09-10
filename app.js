/* 별엽서 – Star Post */
const $=s=>document.querySelector(s);
const R=Math.PI/180, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const S={n:store.get('sp_n',2),lat:37.5665,lon:126.978,place:'',mode:'wait',off:0,az:0,alt:40,cur:null,stamps:store.get('sp_stamps',[]),camOn:false};

/* ---- 카카오톡 인앱 확대 방지 ---- */
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
let lastT=0;document.addEventListener('touchend',e=>{const t=Date.now();if(t-lastT<300&&!e.target.closest('input,[contenteditable]'))e.preventDefault();lastT=t},{passive:false});
document.addEventListener('touchmove',e=>{if(e.scale&&e.scale!==1)e.preventDefault()},{passive:false});

/* ---- 캐릭터 ---- */
const HOOD=['#e6c8a4','#a9b9d9','#d9a8a8','#b7d0b0','#e2d8ae','#c9b1d9'],PANT=['#3b3a44','#2f3a4a','#4a3a3a','#3a4438','#4a4636','#3d3546'],HAIR=['#2a1f1a','#1a1a22','#3d2b20','#5a3a2a','#1f2530','#332a2a'];
function charSVG(i){const h=HOOD[i%6],p=PANT[i%6],hr=HAIR[i%6],v=i%4;
 let hair=v===0?`<circle cx="50" cy="20" r="7" fill="${hr}"/>`:v===1?`<path d="M33 40 Q34 62 50 66 Q66 62 67 40Z" fill="${hr}"/>`:v===2?`<path d="M32 36 Q50 30 68 36 L70 41 Q50 36 30 41Z" fill="#333"/>`:'';
 return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="31" cy="112" rx="14" ry="6" fill="#1b1b1f"/><ellipse cx="69" cy="112" rx="14" ry="6" fill="#1b1b1f"/><rect x="13" y="76" width="30" height="34" rx="13" fill="${p}"/><rect x="57" y="76" width="30" height="34" rx="13" fill="${p}"/><path d="M22 102 C16 62 30 46 50 46 C70 46 84 62 78 102 Z" fill="${h}"/><path d="M24 93 C20 80 36 74 50 74 C64 74 80 80 76 93" stroke="${h}" stroke-width="10" fill="none" stroke-linecap="round" style="filter:brightness(.85)"/><path d="M33 50 Q50 40 67 50" stroke="rgba(255,255,255,.18)" stroke-width="3" fill="none"/>${v===1?hair:''}<circle cx="50" cy="36" r="17" fill="${hr}"/>${v!==1?hair:''}<path d="M37 27 Q50 17 63 27" stroke="rgba(255,255,255,.28)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`}
function renderPeople(){const p=$('#people'),c=$('#charPreview');p.innerHTML=c.innerHTML='';for(let i=0;i<S.n;i++){const d=document.createElement('div');d.innerHTML=charSVG(i);const s=d.firstChild;s.style.marginBottom=(i%2?0:6)+'px';p.appendChild(s);c.appendChild(s.cloneNode(true))}}

/* ---- 온보딩 ---- */
const cr=$('#countRow');for(let i=1;i<=6;i++){const b=document.createElement('button');b.textContent=i;b.onclick=()=>{S.n=i;store.set('sp_n',i);[...cr.children].forEach((x,j)=>x.classList.toggle('on',j+1===i));renderPeople()};cr.appendChild(b)}
cr.children[S.n-1].classList.add('on');renderPeople();

/* ---- 별 스프라이트 ---- */
const COLS=[[165,195,255],[210,225,255],[255,250,240],[255,232,190],[255,200,150]];
const SPR=COLS.map(c=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,`rgba(${c},1)`);gr.addColorStop(.35,`rgba(${c},.35)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,64,64);return cv});
const colIdx=bv=>bv<0?0:bv<.4?1:bv<.8?2:bv<1.3?3:4;
function drawStar(g,x,y,mag,ci,t,ph){const tw=.8+.2*Math.sin(t*(1.7+ph*3)+ph*40)+(Math.random()-.5)*(mag<3?.14:.06);
 const r=clamp(4.4-mag*.78,.8,5.2)*(0.95+tw*.1),a=clamp(1.15-mag*.14,.3,1)*tw;g.globalAlpha=a;const s=r*5;g.drawImage(SPR[ci],x-s/2,y-s/2,s,s);
 g.globalAlpha=Math.min(1,a*1.2);g.fillStyle='#fff';g.beginPath();g.arc(x,y,r*.32,0,6.283);g.fill();
 if(mag<1.6){g.globalAlpha=a*.22;g.strokeStyle='#fff';g.lineWidth=.5;const L=r*4.5;g.beginPath();g.moveTo(x-L,y);g.lineTo(x+L,y);g.moveTo(x,y-L);g.lineTo(x,y+L);g.stroke()}}

/* 온보딩 배경 별 */
(function(){const cv=$('#obStars'),g=cv.getContext('2d');let W,H,pts=[];function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight*.7;pts=Array.from({length:140},()=>[Math.random()*W,Math.random()*H,1+Math.random()*4.5,Math.random()*5|0,Math.random()])}rs();addEventListener('resize',rs);
 (function f(t){if(!$('#onboard').classList.contains('show'))return requestAnimationFrame(f);g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';for(const p of pts)drawStar(g,p[0],p[1],p[2],p[3],t/1000,p[4]);g.globalCompositeOperation='source-over';requestAnimationFrame(f)})(0)})();

/* ---- 천문 계산 ---- */
function jd(d){return d/864e5+2440587.5}
function lst(d,lon){const t=jd(d)-2451545;return((280.46061837+360.98564736629*t+lon)%360+360)%360}
function sunRD(d){const t=jd(d)-2451545,L=(280.46+.9856474*t)%360,g=(357.528+.9856003*t)*R,lam=(L+1.915*Math.sin(g)+.02*Math.sin(2*g))*R,e=(23.439-4e-7*t)*R;return[Math.atan2(Math.cos(e)*Math.sin(lam),Math.cos(lam))/R,Math.asin(Math.sin(e)*Math.sin(lam))/R]}
function enu(ra,dec,LST,lat){const H=(LST-ra)*R,d=dec*R,p=lat*R,sa=Math.sin(d)*Math.sin(p)+Math.cos(d)*Math.cos(p)*Math.cos(H),alt=Math.asin(sa),az=Math.atan2(-Math.sin(H)*Math.cos(d),Math.sin(d)*Math.cos(p)-Math.cos(d)*Math.sin(p)*Math.cos(H)),ca=Math.cos(alt);return[ca*Math.sin(az),ca*Math.cos(az),sa]}
const STARS=SKY.stars.map((s,i)=>({ra:(s[0]+360)%360,dec:s[1],mag:s[2],ci:colIdx(s[3]),ph:(i*.618)%1,v:[0,0,0]}));
const CONS=SKY.cons.map(c=>({id:c.id,ko:c.ko,ra:(c.ra+360)%360,dec:c.dec,lines:c.lines.map(l=>l.map(p=>({ra:(p[0]+360)%360,dec:p[1],v:[0,0,0]}))),v:[0,0,0]}));
let sunAlt=0,lastAstro=0;
function updAstro(){const d=Date.now();if(d-lastAstro<1000)return;lastAstro=d;const L=lst(d,S.lon);for(const s of STARS)s.v=enu(s.ra,s.dec,L,S.lat);for(const c of CONS){c.v=enu(c.ra,c.dec,L,S.lat);for(const l of c.lines)for(const p of l)p.v=enu(p.ra,p.dec,L,S.lat)}
 const[sr,sd]=sunRD(d);sunAlt=Math.asin(enu(sr,sd,L,S.lat)[2])/R;const day=sunAlt>-4;$('#skyBg').classList.toggle('day',day);$('#tint').classList.toggle('day',day)}

/* ---- 방향 (회전행렬) ---- */
function rotM(a,b,g){a*=R;b*=R;g*=R;const cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);return[cA*cG-sA*sB*sG,-sA*cB,cA*sG+sA*sB*cG,sA*cG+cA*sB*sG,cA*cB,sA*sG-cA*sB*cG,-cB*sG,sB,cB*cG]}
let Rt=rotM(0,90,0),Rs=Rt.slice();
function setOri(a,b,g){Rt=rotM(a+S.off,b,g);S.mode='sensor'}
function onOri(e){if(e.alpha==null)return;let a=e.alpha;if(e.webkitCompassHeading!=null)a=360-e.webkitCompassHeading;setOri(a,e.beta,e.gamma);$('#hint').classList.add('off')}
function setManual(){S.mode='manual';Rt=rotM(-S.az,90+S.alt,0);$('#hint').textContent='화면을 드래그해서 하늘을 둘러보세요';$('#hint').classList.remove('off')}
function initSensors(){let abs=false;if('ondeviceorientationabsolute' in window){addEventListener('deviceorientationabsolute',e=>{if(e.alpha!=null){abs=true;onOri(e)}})}
 addEventListener('deviceorientation',e=>{if(!abs)onOri(e)});setTimeout(()=>{if(S.mode==='wait')setManual()},2500);setTimeout(()=>$('#hint').classList.add('off'),7000)}
function smoothR(){for(let i=0;i<9;i++)Rs[i]+=(Rt[i]-Rs[i])*.18;/* 직교화 */const c=[[Rs[0],Rs[3],Rs[6]],[Rs[1],Rs[4],Rs[7]],[Rs[2],Rs[5],Rs[8]]];const n=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)};const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];let x=n(c[0]),y=c[1],d=dot(x,y);y=n([y[0]-d*x[0],y[1]-d*x[1],y[2]-d*x[2]]);const z=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];Rs=[x[0],y[0],z[0],x[1],y[1],z[1],x[2],y[2],z[2]]}
/* 드래그: 수동 모드=둘러보기, 센서 모드=방위 보정 */
(function(){const cv=$('#stars');let px,py,on=false;const dn=e=>{on=true;px=e.clientX;py=e.clientY};const mv=e=>{if(!on)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;if(S.mode==='manual'){S.az=(S.az-dx*.25+360)%360;S.alt=clamp(S.alt+dy*.25,-10,90);Rt=rotM(-S.az,90+S.alt,0)}else{S.off-=dx*.15}};cv.addEventListener('pointerdown',dn);cv.addEventListener('pointermove',mv);addEventListener('pointerup',()=>on=false)})();

/* ---- 렌더 ---- */
const cv=$('#stars'),g=cv.getContext('2d');let W,H,dpr=1,F,fc=0;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(dpr,0,0,dpr,0,0);F=(H/2)/Math.tan(32*R)}
resize();addEventListener('resize',resize);
function proj(v){const x=Rs[0]*v[0]+Rs[3]*v[1]+Rs[6]*v[2],y=Rs[1]*v[0]+Rs[4]*v[1]+Rs[7]*v[2],z=Rs[2]*v[0]+Rs[5]*v[1]+Rs[8]*v[2];if(z>-.08)return null;return[W/2+F*x/-z,H/2-F*y/-z]}
const DIRS=['북','북동','동','남동','남','남서','서','북서'];
function frame(ts){if(!$('#sky').classList.contains('show')){requestAnimationFrame(frame);return}updAstro();smoothR();const t=ts/1000;g.clearRect(0,0,W,H);
 /* 별자리 선 */const cx=W/2,cy=H/2,rad=Math.min(W,H)*.38;let best=null,bd=1e9;
 for(const c of CONS){const p=proj(c.v);const vis=c.lines.some(l=>l.some(q=>{const pp=proj(q.v);return pp&&pp[0]>0&&pp[0]<W&&pp[1]>0&&pp[1]<H}));if(!vis)continue;c._p=p;if(p){const d=Math.hypot(p[0]-cx,p[1]-cy);if(d<(S.cur===c?rad*1.25:rad)&&d<bd){bd=d;best=c}}
  const sel=S.cur===c;g.lineWidth=sel?1.6:.8;g.strokeStyle=sel?'rgba(190,215,255,.9)':'rgba(150,170,220,.28)';g.beginPath();for(const l of c.lines){let prev=null;for(const q of l){const pp=proj(q.v);if(pp&&prev&&Math.hypot(pp[0]-prev[0],pp[1]-prev[1])<W*1.5){g.moveTo(prev[0],prev[1]);g.lineTo(pp[0],pp[1])}prev=pp}}g.stroke();c._vis=true}
 if(best!==S.cur){S.cur=best;showCon(best)}
 /* 별 */g.globalCompositeOperation='lighter';for(const s of STARS){if(s.v[2]<-.02)continue;const p=proj(s.v);if(!p||p[0]<-10||p[0]>W+10||p[1]<-10||p[1]>H+10)continue;drawStar(g,p[0],p[1],s.mag,s.ci,t,s.ph)}g.globalCompositeOperation='source-over';g.globalAlpha=1;
 /* HUD */const cxw=-Rs[2],cyw=-Rs[5],czw=-Rs[8];const az=(Math.atan2(cxw,cyw)/R+360)%360,alt=Math.asin(clamp(czw,-1,1))/R;
 if((fc++)%12===0)$('#hudDir').textContent=`${DIRS[Math.round(az/45)%8]} ${az.toFixed(0)}° · 고도 ${alt.toFixed(0)}°${S.mode==='manual'?' · 수동':''}`;
 if($('#machine').classList.contains('show'))drawWindow(mc,mcv.width,mcv.height,$('#mWindow').getBoundingClientRect());
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
const mcv=$('#mCanvas'),mc=mcv.getContext('2d');
function drawWindow(o,Wi,Hi,r,x=0,y=0){const gr=o.createLinearGradient(0,y,0,y+Hi);gr.addColorStop(0,'#070b1e');gr.addColorStop(1,'#182450');o.fillStyle=gr;o.fillRect(x,y,Wi,Hi);
 if(S.camOn){try{o.globalAlpha=.55;const v=$('#cam'),vw=v.videoWidth,vh=v.videoHeight,sc=Math.max(W/vw,H/vh),ox=(vw*sc-W)/2,oy=(vh*sc-H)/2;o.drawImage(v,(r.left+ox)/sc,(r.top+oy)/sc,r.width/sc,r.height/sc,x,y,Wi,Hi);o.globalAlpha=1;o.fillStyle='rgba(5,8,25,.45)';o.fillRect(x,y,Wi,Hi)}catch(e){}}
 o.drawImage(cv,r.left*dpr,r.top*dpr,r.width*dpr,r.height*dpr,x,y,Wi,Hi)}

/* ---- 별자리 설명 ---- */
const DESC={Ori:'겨울 밤하늘의 왕. 허리띠 세 별과 붉은 베텔게우스, 푸른 리겔이 사냥꾼의 모습을 그려요.',UMa:'북두칠성이 들어 있는 큰곰자리. 국자 끝 두 별을 이으면 북극성을 찾을 수 있어요.',UMi:'북극성이 꼬리 끝에 있는 작은곰자리. 밤새 거의 움직이지 않는 하늘의 중심이에요.',Cas:'W자 모양의 카시오페이아. 사계절 내내 북쪽 하늘에서 볼 수 있어요.',Cyg:'여름 은하수 위를 나는 백조. 십자 모양이라 북십자성이라고도 불러요.',Lyr:'거문고자리. 여름 대삼각형의 꼭짓점인 직녀성(베가)이 반짝여요.',Aql:'독수리자리. 견우성(알타이르)이 은하수 건너 직녀를 바라보고 있어요.',Sco:'붉은 심장 안타레스를 가진 전갈. 여름 남쪽 하늘에 S자로 누워 있어요.',Sgr:'궁수자리. 우리 은하 중심 방향이라 은하수가 가장 진하게 보이는 곳이에요.',Leo:'봄의 사자자리. 물음표를 뒤집은 모양의 머리와 밝은 레굴루스가 특징이에요.',Gem:'쌍둥이자리. 카스토르와 폴룩스 두 별이 나란히 형제처럼 빛나요.',Tau:'황소자리. 붉은 눈 알데바란과 작은 국자 같은 플레이아데스 성단이 있어요.',CMa:'큰개자리. 밤하늘에서 가장 밝은 별 시리우스가 오리온을 따라다녀요.',CMi:'작은개자리. 밝은 프로키온이 겨울 대삼각형을 만들어요.',Boo:'목동자리. 주황빛 아르크투루스는 봄 밤하늘에서 가장 밝은 별이에요.',Vir:'처녀자리. 봄의 대곡선 끝에 하얀 스피카가 놓여 있어요.',And:'안드로메다자리. 맨눈으로 보이는 가장 먼 천체, 안드로메다 은하가 여기 있어요.',Per:'페르세우스자리. 변광성 알골이 "악마의 별"이라 불리며 깜박여요.',Peg:'가을 밤의 페가수스. 큰 사각형이 하늘을 나는 말의 몸통이에요.',Cnc:'게자리. 희미하지만 가운데에 벌집 성단(프레세페)이 숨어 있어요.',Aur:'마차부자리. 오각형 꼭대기에 노란 카펠라가 빛나요.',Dra:'용자리. 큰곰과 작은곰 사이를 길게 굽이치며 지나가요.',Her:'헤르쿨레스자리. 밝은 별은 없지만 구상성단 M13이 유명해요.',CrB:'북쪽왕관자리. 작은 반원이 정말 왕관처럼 보여요.',Cep:'세페우스자리. 집 모양의 다섯 별이 카시오페이아 옆에 있어요.',Ari:'양자리. 봄의 시작을 알리던 황도 12궁의 첫 번째 별자리예요.',Aqr:'물병자리. 가을 남쪽 하늘에 물을 쏟는 모습으로 길게 펼쳐져 있어요.',Psc:'물고기자리. 끈으로 묶인 두 마리 물고기가 페가수스 아래에 있어요.',Lib:'천칭자리. 전갈의 집게였던 두 별이 저울이 되었어요.',Cap:'염소자리. 삼각형 모양의 바다염소가 가을 초저녁 남쪽에 떠요.',Cru:'남십자자리. 남반구의 상징으로 우리나라에서는 보기 어려워요.',Oph:'뱀주인자리. 여름 남쪽 하늘에 커다란 집 모양으로 서 있어요.',Crv:'까마귀자리. 작은 사다리꼴 네 별이 봄 남쪽 하늘에 떠요.',Del:'돌고래자리. 작고 앙증맞은 마름모가 은하수 옆에서 뛰어올라요.',Lep:'토끼자리. 오리온 발밑에서 사냥개를 피해 웅크리고 있어요.',Eri:'에리다누스자리. 리겔 옆에서 시작해 남쪽으로 길게 흐르는 강이에요.'};
function season(ra){const m=(Math.round(9+ra/30)%12)+1;return m>=3&&m<=5?'봄':m>=6&&m<=8?'여름':m>=9&&m<=11?'가을':'겨울'}
function showCon(c){const el=$('#conInfo');if(!c){el.classList.remove('show');$('#stampBtn').classList.remove('show');return}
 el.querySelector('.con-name').innerHTML=`${c.ko}<small>${c.id}</small>`;el.querySelector('.con-desc').textContent=DESC[c.id]||`${c.ko}. ${season(c.ra)} 밤하늘에서 가장 잘 보이는 별자리예요.`;el.classList.add('show');$('#stampBtn').classList.add('show')}

/* ---- 권한 & 시작 ---- */
async function startCam(){try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});const v=$('#cam');v.srcObject=st;v.classList.add('on');S.camOn=true;$('#camToggle').textContent='●';return true}catch(e){return false}}
function stopCam(){const v=$('#cam');(v.srcObject?.getTracks()||[]).forEach(t=>t.stop());v.srcObject=null;v.classList.remove('on');S.camOn=false;$('#camToggle').textContent='◐'}
$('#camToggle').onclick=()=>S.camOn?stopCam():startCam();
async function geocode(){try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${S.lat}&lon=${S.lon}&zoom=14&accept-language=ko`);const j=await r.json();const a=j.address||{};S.place=[a.city||a.province||a.state,a.borough||a.district||a.county||a.town||a.suburb||a.neighbourhood].filter(Boolean).join(' ')||j.display_name.split(',')[0]}catch(e){S.place=`${S.lat.toFixed(2)}, ${S.lon.toFixed(2)}`}$('#hudPlace').textContent=S.place;if(!$('#pcWhere').value)$('#pcWhere').value=S.place}
$('#startBtn').onclick=async()=>{try{if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')setManual()}}catch(e){setManual()}
 initSensors();startCam();$('#onboard').classList.remove('show');$('#sky').classList.add('show');renderPeople();updCount();
 if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{S.lat=p.coords.latitude;S.lon=p.coords.longitude;lastAstro=0;geocode()},()=>{$('#hudPlace').textContent='위치 없음 · 서울 기준';S.place='서울'},{timeout:8000,maximumAge:6e5});else geocode()};

/* ---- 스탬프 기계 ---- */
$('#stampBtn').onclick=()=>$('#machine').classList.add('show');
$('#mClose').onclick=()=>$('#machine').classList.remove('show');
let pending=null;
$('#pressBtn').onclick=()=>{const m=$('#machine .machine'),fl=$('.m-flash');m.classList.add('press');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');
 setTimeout(()=>{m.classList.remove('press');const img=makeStamp();pending={img,con:S.cur?S.cur.id:'',ko:S.cur?S.cur.ko:'하늘',date:Date.now()};$('#nImg').src=img;$('#nName').value='';$('#nName').placeholder=pending.ko;$('#nDate').textContent=fmt(pending.date);$('#machine').classList.remove('show');$('#naming').classList.add('show')},380)};
function makeStamp(){const r=$('#mWindow').getBoundingClientRect(),k=1.5,Wi=240*k,Hi=300*k,m=16*k,out=document.createElement('canvas');out.width=Wi+2*m;out.height=Hi+2*m;const o=out.getContext('2d');
 o.fillStyle='#f3efe6';o.fillRect(0,0,out.width,out.height);drawWindow(o,Wi,Hi,r,m,m);
 if(S.cur){const mp=p=>[m+(p[0]-r.left)/r.width*Wi,m+(p[1]-r.top)/r.height*Hi];o.save();o.beginPath();o.rect(m,m,Wi,Hi);o.clip();o.strokeStyle='rgba(220,235,255,.95)';o.lineWidth=1.6*k;o.lineCap='round';o.beginPath();const pts=[];for(const l of S.cur.lines){let prev=null;for(const q of l){const pp=proj(q.v);if(pp){const w=mp(pp);pts.push(w);if(prev){o.moveTo(prev[0],prev[1]);o.lineTo(w[0],w[1])}prev=w}else prev=null}}o.stroke();o.globalCompositeOperation='lighter';for(const w of pts)drawStar(o,w[0],w[1],1.2,2,0,.5);o.restore()}
 o.fillStyle='rgba(255,255,255,.85)';o.font=`${9*k}px Georgia,serif`;o.textAlign='left';o.fillText('STAR POST',m+10*k,m+Hi-10*k);o.textAlign='right';o.font=`bold ${11*k}px "Noto Sans KR",sans-serif`;o.fillText(S.cur?S.cur.ko:'',m+Wi-10*k,m+Hi-10*k);
 o.strokeStyle='rgba(255,255,255,.35)';o.lineWidth=k;o.strokeRect(m+3*k,m+3*k,Wi-6*k,Hi-6*k);
 o.globalCompositeOperation='destination-out';const step=14*k,rr=5*k;for(let x=0;x<=out.width;x+=step){o.beginPath();o.arc(x,0,rr,0,7);o.arc(x,out.height,rr,0,7);o.fill()}for(let y=0;y<=out.height;y+=step){o.beginPath();o.arc(0,y,rr,0,7);o.arc(out.width,y,rr,0,7);o.fill()}
 return out.toDataURL('image/png')}
const fmt=d=>{const x=new Date(d);return `${x.getFullYear()}. ${x.getMonth()+1}. ${x.getDate()}`};
$('#nClose').onclick=()=>$('#naming').classList.remove('show');
$('#nSave').onclick=()=>{if(!pending)return;pending.name=$('#nName').value.trim()||pending.ko;S.stamps.push(pending);try{localStorage.setItem('sp_stamps',JSON.stringify(S.stamps))}catch(e){alert('저장 공간이 가득 찼어요. 엽서를 이미지로 저장한 뒤 우표를 몇 개 떼어 주세요.')}pending=null;$('#naming').classList.remove('show');updCount();openPost()};
function updCount(){$('#postCount').textContent=S.stamps.length}

/* ---- 엽서 ---- */
const PC=store.get('sp_pc',{});$('#pcMsg').textContent=PC.msg||'';$('#pcWith').value=PC.with||'';$('#pcWhere').value=PC.where||'';
function savePC(){store.set('sp_pc',{msg:$('#pcMsg').textContent,with:$('#pcWith').value,where:$('#pcWhere').value})}
['#pcMsg','#pcWith','#pcWhere'].forEach(s=>$(s).addEventListener('input',savePC));
function openPost(){renderStamps();$('#sky').classList.remove('show');$('#postcard').classList.add('show')}
$('#postBtn').onclick=openPost;$('#pcBack').onclick=()=>{$('#postcard').classList.remove('show');$('#sky').classList.add('show')};
function renderStamps(){const box=$('#pcStamps');box.innerHTML='';S.stamps.forEach((s,i)=>{const im=new Image();im.src=s.img;im.title=s.name;im.style.setProperty('--r',((i*37)%9-4)+'deg');let tm;const st=()=>{tm=setTimeout(()=>{if(confirm(`'${s.name}' 우표를 뗄까요?`)){S.stamps.splice(i,1);store.set('sp_stamps',S.stamps);updCount();renderStamps()}},600)},en=()=>clearTimeout(tm);im.addEventListener('touchstart',st,{passive:true});im.addEventListener('touchend',en);im.addEventListener('touchmove',en);im.addEventListener('mousedown',st);im.addEventListener('mouseup',en);im.addEventListener('contextmenu',e=>e.preventDefault());box.appendChild(im)});
 const ds=S.stamps.map(s=>s.date);$('#pcDate').textContent=ds.length?(ds.length>1&&fmt(Math.min(...ds))!==fmt(Math.max(...ds))?fmt(Math.min(...ds))+' ~ '+fmt(Math.max(...ds)):fmt(ds[0])):fmt(Date.now());
 if(!$('#pcWith').value&&S.n>1)$('#pcWith').placeholder=`${S.n}명이 함께`}
$('#pcSave').onclick=async()=>{const b=$('#pcSave');b.textContent='만드는 중…';document.activeElement?.blur();const ins=[...document.querySelectorAll('#card input')],phs=ins.map(i=>i.placeholder);ins.forEach(i=>i.placeholder='');$('#pcMsg').removeAttribute('data-ph');try{const c=await html2canvas($('#card'),{scale:2,backgroundColor:null,useCORS:true});$('#pvImg').src=c.toDataURL('image/png');$('#preview').classList.add('show')}catch(e){alert('이미지 생성에 실패했어요. 스크린샷으로 저장해 주세요.')}ins.forEach((i,j)=>i.placeholder=phs[j]);$('#pcMsg').dataset.ph='여기에 그날의 하늘을 적어 보세요.';b.textContent='이미지로 저장'};
$('#pvClose').onclick=()=>$('#preview').classList.remove('show');
updCount();
