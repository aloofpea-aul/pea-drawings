/* spec3d.js — ภาพ 3D และ 2D (ภาพฉาย 3 ด้าน) ของอุปกรณ์ในเมนู "อุปกรณ์" สร้างจากชื่อและขนาดในรายการ
   เป็นภาพประกอบโดยประมาณ ไม่ใช่แบบมาตรฐาน — ขนาดหน่วย มม.
   SPEC3D.type(item) -> ชนิด หรือ null · SPEC3D.mount(el,item,row) · SPEC3D.draw2d(el,item,row)
   ตอนนี้รองรับเล่ม 3 (คู่มืออุปกรณ์ไฟฟ้า 2565 ระบบจำหน่ายแรงสูง/แรงต่ำ) */
(function(){
"use strict";
var THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
var BOOKS={3:1};
var tP=null;
function three(){ if(window.THREE) return Promise.resolve(window.THREE);
  if(!tP) tP=new Promise(function(ok,no){var s=document.createElement("script");s.src=THREE_URL;s.onload=function(){ok(window.THREE);};s.onerror=function(){tP=null;no(new Error("โหลดตัวแสดงภาพ 3D ไม่ได้ (ตรวจอินเทอร์เน็ต)"));};document.head.appendChild(s);});
  return tP; }

/* ---------- จัดชนิดจากชื่อรายการ (เรียงจากเฉพาะเจาะจงไปทั่วไป) ---------- */
var RULES=[
 [/กราวด์วายร์แคล้มป์/,"gwclamp"],[/กิ่งโคม/,"lamparm"],[/แผ่นเหล็กประกับเสาตอม่อ/,"stubplate"],[/เสาตอม่อ/,"stub"],[/เสาคอนกรีต/,"pole"],
 [/คอน คอร|คาน คอร/,"concarm"],[/เหล็กคอนเคเบิลอากาศ/,"cablebracket"],[/คอนสื่อสาร/,"commarm"],
 [/เหล็กประกับคอนแบบท้าวแขน/,"angle"],[/เหล็กประกับ|BRACE, FLAT/,"flatbar"],[/เหล็กฉากรับคอนสาย/,"vbrace"],
 [/เหล็กรูปรางน้ำ/,"channel"],[/เหล็กฉาก/,"angle"],
 [/สลักเกลียวห่วงกลม|DOUBLE ARMING, ROUND EYE/,"eyeda"],[/สลักห่วงแบบธรรมดาเดี่ยว/,"eye45"],[/สลักห่วงกลม/,"eyebolt"],
 [/สลักเกลียวตลอด/,"dabolt"],[/สตับโบลท์/,"stubbolt"],[/สลักเกลียว/,"bolt"],[/นัทรูปห่วง/,"eyenut"],
 [/แหวนสี่เหลี่ยมโค้ง/,"sqwasherc"],[/แหวนสี่เหลี่ยม/,"sqwasher"],[/แหวนสปริง/,"spring"],[/แหวนรอง/,"washer"],
 [/ก้านสมอบกแบบห่วงสองร่อง/,"anchorrod2"],[/ก้านสมอบก/,"anchorrod"],[/แผ่นห่วงสำหรับสายยึดโยง/,"guyplate"],
 [/ทิมเบิล/,"thimble"],[/ท้าวแขน/,"sidewalkarm"],[/กายการ์ด/,"guyguard"],[/ยูแคล้มป์/,"uclamp"],[/แผ่นสมอบก/,"anchorplate"],
 [/กราวด์วายร์แคล้มป์/,"gwclamp"],[/ลวดเหล็ก|ลวดอะลูมิเนียม/,"wirecoil"],[/ท่อ พีวีซี/,"conduit"],[/หลักดิน/,"groundrod"],
 [/ไลน์โพสท์|พินโพสท์/,"linepost"],[/ลูกถ้วยแขวน/,"disc"],[/ที่จับลูกรอก/,"spoolholder"],[/ลูกรอก/,"spool"],[/ลูกถ้วยยึดโยง/,"strainins"],
 [/^แร็ค/,"rack"],[/สเตรนแคล้มป์/,"strainclamp"],[/เคเบิลสเปเซอร์/,"spacer"],[/ที่แขวนสายหุ้มฉนวน|อุปกรณ์แขวนเคเบิล/,"hanger"],
 [/ชุดต่อปลายสายเคเบิล/,"termination"],[/ไลน์การ์ด|อาร์เมอร์ร็อด/,"helixrod"],[/แดมเปอร์/,"damper"],[/ปรีฟอร์มเข้าปลายสาย/,"deadend"],
 [/ฮอทไลน์แคล้มป์/,"hotline"],[/สเตอร์รัพ|เบล /,"bail"],[/พี\.จี\. คอนเนคเตอร์/,"pg"],[/แบบเอช|H-CONNECTOR/,"hconn"],
 [/คอนเนคเตอร์ เข้าปลายสาย/,"deadendconn"],[/หางปลา/,"lug"],[/IPC|ต่อแยกสายแรงต่ำแบบหุ้มฉนวน/,"ipc"],[/หลอดต่อสาย/,"splice"],
 [/เคเบิลใต้ดิน/,"ugcable"],[/พันเกลียว/,"twisted"],[/เคเบิลอากาศ/,"aerial"],[/สายทองแดงตีเกลียวหุ้มฉนวน/,"multicore"],
 [/สายอะลูมิเนียมหุ้มฉนวน/,"inscable"],[/สายอะลูมิเนียมแกนเหล็ก/,"acsr"],[/สายอะลูมิเนียมเปลือย/,"bare"],[/เทปไฟฟ้า/,"tape"],
 [/สมาร์ทมิเตอร์/,"smartmeter"],[/วัตต์อาวร์มิเตอร์ 3 เฟส/,"meter3"],[/วัตต์อาวร์มิเตอร์/,"meter1"],[/แป้นรองมิเตอร์/,"meterplate"],
 [/ตู้อะลูมิเนียม|พร้อมตู้/,"cabinet"],[/วี\.ที\./,"vt"],[/ซี\.ที\. แรงต่ำ/,"ctwin"],[/ซี\.ที\./,"ctout"],
 [/ฟิวส์สวิตช์/,"fuseswitch"],[/เอชอาร์ซี/,"hrc"],[/ฐานฟิวส์/,"dbase"],[/ดี-คาทริดจ์/,"dfuse"],[/ดรอพเอาต์/,"cutout"],[/ฟิวส์ลิงค์/,"fuselink"],
 [/กับดักเสิร์จแรงต่ำ/,"lvarr"],[/กับดักเสิร์จแรงสูง/,"hvarr"],[/ป้องกันสัตว์/,"animal"],[/เพาเวอร์ฟิวส์|ฟิวส์ ชนิด อี/,"powerfuse"],
 [/เอสเอฟซิกซ์|SF6/,"sf6"],[/สวิตช์ตัดตอน/,"disconnect"],[/รีโคลสเซอร์/,"recloser"],[/เหล็กจับขอบถังหม้อแปลง/,"tankclamp"],
 [/หม้อแปลง 1 เฟส/,"tr1"],[/หม้อแปลง 3 เฟส/,"tr3"],[/ที่แขวนคะแปซิเตอร์/,"caphanger"],[/คะแปซิเตอร์/,"capacitor"],
 [/เหล็กแขวนท่อ/,"pipehanger"],[/พลังแสง/,"photocell"],[/ฟลูออเรสเซนต์/,"fluor"],[/โคมไฟถนน/,"ledlight"],[/กิ่งโคม/,"lamparm"]
];
function nameOf(it){return (it.th||"")+" / "+(it.en||"")+" / "+((it.rows[0]||[])[1]||"");}
function type(it){ if(!it||!BOOKS[it.k||3]) return null; var n=nameOf(it); for(var i=0;i<RULES.length;i++) if(RULES[i][0].test(n)) return RULES[i][1]; return null; }

/* ---------- อ่านขนาดจากข้อความ ---------- */
function clean(t){return String(t||"").replace(/(\d),(\d{3})/g,"$1$2").replace(/×|X(?=\s*\d)/g,"x").replace(/\s+/g," ");}
function dims(t){ t=clean(t); var r={},m;
  if(m=t.match(/M\s?(\d+)\s*x\s*(\d+)/i)){r.d=+m[1];r.L=+m[2];} else if(m=t.match(/M\s?(\d+)/)) r.d=+m[1];
  if(m=t.match(/T\s*=\s*(\d+)/)) r.T=+m[1];
  if(m=t.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(ซม|cm)?/i)){var k=m[4]?10:1;r.a=+m[1]*k;r.b=+m[2]*k;r.c=+m[3]*k;}
  else if(m=t.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(มม|mm)/i)){r.a=+m[1];r.b=+m[2];}
  if(m=t.match(/ยาว\s*\(?L?\)?\s*(\d+(?:\.\d+)?)\s*(มม|mm|ม\.|m\b)/i)) r.len=+m[1]*(/มม|mm/i.test(m[2])?1:1000);
  else if(m=t.match(/(\d+(?:\.\d+)?)\s*(?:mm|มม\.?)\s*LONG/i)) r.len=+m[1]; else if(m=t.match(/(\d+(?:\.\d+)?)\s*m LONG/i)) r.len=+m[1]*1000;
  if(m=t.match(/L\s*[≥=]\s*(\d+)/)) r.Ls=+m[1];
  if(m=t.match(/ขนาดเสา\s*(\d+(?:\.\d+)?)\s*ม/)) r.pole=+m[1];
  if(m=t.match(/(\d)\s*-\s*1\s*x\s*(\d+)/)){r.n=+m[1];r.mm2=+m[2];}
  else if(m=t.match(/(\d)\s*x\s*(\d+(?:\.\d+)?)\s*ตร/)){r.n=+m[1];r.mm2=+m[2];}
  else if(m=t.match(/(\d+(?:\.\d+)?)(?:\/\d+)?\s*ตร\.?\s*มม/)) r.mm2=+m[1];
  if(m=t.match(/(\d+)\s*kVA/i)) r.kva=+m[1];
  if(m=t.match(/[øØ]\s*(\d+(?:\.\d+)?)/)) r.dia=+m[1];
  if(m=t.match(/(\d+(?:\.\d+)?)\s*kV\b/)) r.kv=+m[1];
  if(m=t.match(/(\d+(?:\.\d+)?)\s*(?:แอมป์|A\b)/)) r.amp=+m[1];
  return r; }

/* ---------- ชิ้นส่วนพื้นฐาน ---------- */
var T,M={};
function mats(){ if(M.steel) return M; var S=function(c,m,r){return new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});};
  M.steel=S(0xc4cbd2,.3,.4);M.galv=S(0xb7bec6,.35,.45);M.dark=S(0x6f777f,.3,.5);M.alu=S(0xdfe3e7,.25,.35);M.cu=S(0xc8794a,.35,.4);
  M.wood=S(0xb98a55,0,.8);M.pvc=S(0x2a2d31,0,.55);M.grey=S(0x9aa1a8,.1,.6);M.lgrey=S(0xc9ced3,.05,.6);M.porc=S(0x8a4b2c,.05,.25);M.wporc=S(0xe9e6df,.02,.25);
  M.white=S(0xeef0f2,0,.4);M.conc=S(0xb3aea4,0,.95);M.red=S(0xc0392b,0,.5);M.yellow=S(0xe0b42a,0,.5);M.blue=S(0x3a6ea5,0,.5);M.green=S(0x4f8a5b,0,.6);
  M.poly=S(0x7d8a96,0,.5);M.glass=new T.MeshStandardMaterial({color:0x9fc3d9,metalness:0,roughness:.1,transparent:true,opacity:.55});
  M.tank=S(0x9da5ad,.2,.55);M.hdpe=S(0x3c4248,0,.6);return M; }
function G(){return new T.Group();}
function at(o,x,y,z){o.position.set(x||0,y||0,z||0);return o;}
function cyl(r1,r2,h,mat,seg){return new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg||24),mat);}
function cylX(r,h,mat,seg){var c=cyl(r,r,h,mat,seg);c.rotation.z=Math.PI/2;return c;}
function cylZ(r,h,mat,seg){var c=cyl(r,r,h,mat,seg);c.rotation.x=Math.PI/2;return c;}
function box(x,y,z,mat){return new T.Mesh(new T.BoxGeometry(x,y,z),mat);}
function tor(R,r,mat,arc){return new T.Mesh(new T.TorusGeometry(R,r,10,32,arc||Math.PI*2),mat);}
function hexN(d,h,mat){return cyl(d*.92,d*.92,h,mat,6);}
function ext(pts,depth,mat,holes){var s=new T.Shape();pts.forEach(function(p,i){i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]);});
  (holes||[]).forEach(function(h){var p=new T.Path();p.absarc(h[0],h[1],h[2],0,Math.PI*2,true);s.holes.push(p);});
  return new T.Mesh(new T.ExtrudeGeometry(s,{depth:depth,bevelEnabled:false,curveSegments:24}),mat);}
function lathe(pts,mat,seg){return new T.Mesh(new T.LatheGeometry(pts.map(function(p){return new T.Vector2(p[0],p[1]);}),seg||40),mat);}
function tube(pts,r,mat,closed){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(function(p){return new T.Vector3(p[0],p[1],p[2]);}),!!closed),Math.max(24,pts.length*6),r,10,!!closed),mat);}
/* แท่งเกลียวตามแกน X เริ่มที่ x0 ยาว L */
function threadX(g,d,L,x0,mat){g.add(at(cylX(d/2*.92,L,mat||M.galv,20),x0+L/2,0,0));var step=Math.max(2.5,d*.25),n=0;
  for(var x=x0+step/2;x<x0+L&&n<70;x+=step,n++){var r=tor(d/2*.93,Math.max(.35,d*.04),mat||M.galv);r.rotation.y=Math.PI/2;g.add(at(r,x,0,0));}}
function nutX(g,d,x,mat){var n=hexN(d,d*.8,mat||M.galv);n.rotation.z=Math.PI/2;g.add(at(n,x,0,0));}
function sheds(g,n,r0,r1,pitch,y0,mat){for(var i=0;i<n;i++){g.add(at(cyl(r1,r1*.92,pitch*.18,mat,28),0,y0+i*pitch,0));}g.add(at(cyl(r0,r0,n*pitch,mat,24),0,y0+(n-1)*pitch/2,0));}
function bushing(g,x,y,z,h,mat){var b=G();sheds(b,Math.max(2,Math.round(h/45)),h*.11,h*.22,h/Math.max(2,Math.round(h/45)),h*.1,mat||M.porc);b.add(at(cyl(5,5,h*.25,M.cu,12),0,h+h*.08,0));g.add(at(b,x,y,z));return b;}
function holesRow(g,n,L,y,z,r,axis){/* แสดงรูเจาะเป็นวงกลมเข้ม */for(var i=0;i<n;i++){var c=cylZ(r,1,M.pvc,16);var x=-L/2+L*(i+1)/(n+1);g.add(at(c,x,y,z));}}
function f(n){return Math.round(n).toLocaleString("en-US");}

/* ---------- ตัวสร้างแต่ละชนิด (คืน {g,lab,note}) ---------- */
var B={
 pole:function(t,D){var H=(D.pole||9)*1000,g=G(),tb=150+H/40,bb=tb+H*.012;var p=cyl(tb/1.41,bb/1.41,H,M.conc,4);p.rotation.y=Math.PI/4;g.add(at(p,0,H/2,0));
   for(var y=H*.55;y<H-200;y+=300){g.add(at(cylZ(12,bb+4,M.pvc,10),0,y,0));}return {g:g,lab:"เสาคอนกรีต "+(D.pole||"-")+" ม.",note:"หน้าตัดสี่เหลี่ยมเรียว พร้อมรูสำหรับสลัก"};},
 stub:function(t,D){var a=D.a||250,b=D.b||a,L=D.len||D.c||2500,g=G();g.add(at(box(a,L,b,M.conc),0,L/2,0));return {g:g,lab:"เสาตอม่อ "+f(a)+"×"+f(b)+" ยาว "+f(L)+" มม."};},
 stubplate:function(t,D){var g=G(),L=600,W=250,c=12;g.add(at(box(W,L,c,M.galv),0,L/2,0));[L*.15,L*.4,L*.6,L*.85].forEach(function(y){g.add(at(cylZ(11,c+2,M.pvc,16),0,y,0));});
   if(/คู่/.test(t)){g.add(at(box(W,L,c,M.galv),0,L/2,-180));}return {g:g,lab:"แผ่นเหล็กประกับเสาตอม่อ"+(/คู่/.test(t)?"คู่":"เดี่ยว"),note:"ขนาดแผ่นโดยประมาณ"};},
 concarm:function(t,D){var a=D.a||100,b=D.b||a,L=D.c||1500,g=G();g.add(box(L,a,b,M.conc));holesRow(g,4,L,0,b/2+.6,9);
   return {g:g,lab:(/คาน/.test(t)?"คาน":"คอน")+" คอร. "+f(a)+"×"+f(b)+"×"+f(L)+" มม.",note:/สปัน/.test(t)?"ชนิดสปัน":""};},
 channel:function(t,D,ang){var L=Math.min(D.len||D.c||2400,6000),g=G(),s=[];
   if(ang){var a=D.a||65,c=D.c&&D.c<30?D.c:(D.b&&D.b<30?D.b:6);s=[[0,0],[a,0],[a,c],[c,c],[c,a],[0,a]];var m=ext(s,L,M.galv);m.rotation.y=Math.PI/2;g.add(at(m,-L/2,0,0));
     return {g:g,lab:"เหล็กฉาก "+f(a)+"×"+f(a)+"×"+c+" มม. ยาว "+f(L)+" มม."};}
   var h=D.a||100,b=D.b||50,tw=D.c||6;s=[[0,0],[b,0],[b,tw],[tw,tw],[tw,h-tw],[b,h-tw],[b,h],[0,h]];var m2=ext(s,L,M.galv);m2.rotation.y=Math.PI/2;g.add(at(m2,-L/2,-h/2,0));
   return {g:g,lab:"เหล็กรูปรางน้ำ "+f(h)+"×"+f(b)+"×"+tw+" มม. ยาว "+f(L)+" มม."};},
 angle:function(t,D){return B.channel(t,D,true);},
 commarm:function(t,D){var r=B.channel(t,{a:D.a||100,b:D.b||50,c:D.c&&D.c<30?D.c:5,len:D.len||1000});r.g.traverse(function(o){if(o.isMesh)o.material=M.blue;});r.lab="คอนสื่อสาร (เหล็กเคลือบฉนวน) ยาว "+f(D.len||1000)+" มม.";return r;},
 flatbar:function(t,D){var w=D.a||30,th=D.b||6,L=D.c||760,g=G();g.add(box(L,w,th,M.galv));[-L/2+30,L/2-30].forEach(function(x){g.add(at(cylZ(9,th+2,M.pvc,16),x,0,0));});
   return {g:g,lab:"เหล็กประกับ "+w+"×"+th+"×"+f(L)+" มม."};},
 vbrace:function(t,D){var g=G(),span=1800,drop=450,a=D.a||50;var L=Math.hypot(span/2,drop);
   [-1,1].forEach(function(s){var r=B.channel(t,{a:a,c:6,len:L},true).g;r.rotation.z=s*Math.atan2(drop,span/2);g.add(at(r,s*span/4,-drop/2,0));});
   return {g:g,lab:"เหล็กฉากรับคอนสาย "+a+"×"+a+" มม.",note:"ช่วงกว้าง 1,800 ดรอพ 450 มม."};},
 cablebracket:function(t,D){var g=G();g.add(at(box(60,500,60,M.galv),0,0,0));g.add(at(box(700,60,60,M.galv),350,200,0));var br=box(560,30,40,M.galv);br.rotation.z=.55;g.add(at(br,240,-30,0));
   var cl=tor(30,8,M.galv,Math.PI);cl.rotation.z=Math.PI;g.add(at(cl,640,170,0));return {g:g,lab:"เหล็กคอนเคเบิลอากาศ",note:clean(t).match(/ทางโค้ง|ทางตรง/)?(clean(t).match(/ทางโค้ง|ทางตรง/)[0]):""};},
 bolt:function(t,D){var d=D.d||16,L=D.L||200,Tt=Math.min(D.T||L,L),g=G();var h=hexN(d,d*.65,M.galv);h.rotation.z=Math.PI/2;g.add(at(h,-d*.33,0,0));
   g.add(at(cylX(d/2,L-Tt,M.galv,20),(L-Tt)/2,0,0));threadX(g,d,Tt,L-Tt);nutX(g,d,L-d*1.2);
   var w=box(d*.28,d*3.2,d*3.2,M.galv);g.add(at(w,L-d*2,0,0));return {g:g,lab:"M"+d+" × "+f(L)+" มม.",note:D.T?"ยาวเกลียว "+D.T+" มม.":"หัวหกเหลี่ยม + แหวน + แป้นเกลียว"};},
 dabolt:function(t,D){var d=D.d||16,L=D.L||400,g=G();threadX(g,d,L,0);[d*1.2,L-d*1.2].forEach(function(x){nutX(g,d,x);});return {g:g,lab:"สลักเกลียวตลอด M"+d+" × "+f(L)+" มม.",note:"แป้นเกลียว 2 ตัว"};},
 eyebolt:function(t,D,da){var d=D.d||16,L=D.L||250,Tt=Math.min(D.T||L*.7,L),g=G();var e=tor(d*1.7,d*.45,M.galv);g.add(at(e,-d*2.1,0,0));
   g.add(at(cylX(d/2,L-Tt,M.galv,20),(L-Tt)/2,0,0));threadX(g,d,Tt,L-Tt);nutX(g,d,L-d*1.2);if(da)nutX(g,d,L*.45);
   return {g:g,lab:(da?"สลักเกลียวห่วงกลม (ตลอด) ":"สลักห่วงกลม ")+"M"+d+" × "+f(L)+" มม."};},
 eyeda:function(t,D){return B.eyebolt(t,D,true);},
 eye45:function(t,D){var r=B.eyebolt(t,D);r.g.children[0].rotation.y=Math.PI/4;r.lab="สลักห่วงเดี่ยว 45° M"+(D.d||16)+" × "+f(D.L||250)+" มม.";return r;},
 stubbolt:function(t,D){var d=D.d||24,L=D.L||800,g=G();threadX(g,d,150,L-150);g.add(at(cylX(d/2,L-150,M.galv,20),(L-150)/2,0,0));
   var hk=tor(60,d/2,M.galv,Math.PI);hk.rotation.z=Math.PI/2;g.add(at(hk,0,60,0));nutX(g,d,L-60);return {g:g,lab:"สตับโบลท์ M"+d+" × "+f(L)+" มม.",note:"ปลายงอสำหรับฝังคอนกรีต"};},
 eyenut:function(t,D){var d=D.d||16,g=G();var e=tor(d*1.4,d*.42,M.galv);g.add(at(e,0,d*2.1,0));var n=cyl(d*1.1,d*1.1,d*.9,M.galv,20);g.add(n);g.add(at(cyl(d*.5,d*.5,d*.95,M.pvc,16),0,0,0));
   return {g:g,lab:"นัทรูปห่วง M"+d};},
 sqwasher:function(t,D,curved){var a=D.a||52,c=D.c||4.5,h=D.dia||18,g=G();var m=ext([[-a/2,-a/2],[a/2,-a/2],[a/2,a/2],[-a/2,a/2]],c,M.galv,[[0,0,h/2]]);
   if(curved){var gg=G();gg.add(m);m.geometry.translate(0,0,-c/2);var pos=m.geometry.attributes.position;for(var i=0;i<pos.count;i++){var x=pos.getX(i);pos.setZ(i,pos.getZ(i)+x*x/(a*1.5));}pos.needsUpdate=true;m.geometry.computeVertexNormals();}
   m.rotation.x=-Math.PI/2;g.add(m);return {g:g,lab:"แหวนสี่เหลี่ยม"+(curved?"โค้ง ":"แบน ")+f(a)+"×"+f(a)+"×"+c+" มม. รู ø"+h};},
 sqwasherc:function(t,D){return B.sqwasher(t,D,true);},
 washer:function(t,D){var o=D.dia||30,i=(clean(t).match(/รู\s*[øØ]\s*(\d+)/)||[0,16])[1],g=G(),m;
   var s=new T.Shape();s.absarc(0,0,o/2,0,Math.PI*2);var p=new T.Path();p.absarc(0,0,i/2,0,Math.PI*2,true);s.holes.push(p);m=new T.Mesh(new T.ExtrudeGeometry(s,{depth:3,bevelEnabled:false,curveSegments:32}),M.galv);m.rotation.x=-Math.PI/2;g.add(m);
   return {g:g,lab:"แหวนกลม ø"+o+" รู ø"+i+" มม."};},
 spring:function(t,D){var d=D.d||12,g=G();var q=tor(d*.75,d*.18,M.dark,Math.PI*1.9);q.rotation.x=Math.PI/2;g.add(q);return {g:g,lab:"แหวนสปริง M"+d};},
 anchorrod:function(t,D,two){var d=D.d||16,L=D.len||2000,g=G();g.add(at(cylX(d/2,L,M.galv,16),L/2,0,0));var e=tor(d*2.6,d*.5,M.galv);g.add(at(e,-d*3,0,0));
   if(two){var e2=tor(d*2.6,d*.5,M.galv);e2.rotation.y=Math.PI/2;g.add(at(e2,-d*3,0,0));}threadX(g,d,150,L-150);nutX(g,d,L-40);
   return {g:g,lab:"ก้านสมอบก"+(two?"ห่วงสองร่อง":"ห่วงกลม")+" M"+d+" ยาว "+f(L)+" มม."};},
 anchorrod2:function(t,D){return B.anchorrod(t,D,true);},
 guyplate:function(t,D){var g=G();var p=ext([[0,0],[120,0],[120,40],[90,110],[30,110],[0,40]],8,M.galv,[[60,75,12],[60,20,9]]);g.add(p);return {g:g,lab:"แผ่นห่วงสำหรับสายยึดโยง 30°"};},
 thimble:function(t,D){var g=G();var pts=[];for(var i=0;i<=40;i++){var u=i/40*Math.PI*2;pts.push([Math.sin(u)*30*(1-.35*Math.cos(u)),Math.cos(u)*45,0]);}
   g.add(tube(pts,6,M.galv,true));if(/เคลวิส/.test(t)){g.add(at(box(40,50,8,M.galv),0,-70,14));g.add(at(box(40,50,8,M.galv),0,-70,-14));g.add(at(cylZ(7,50,M.galv),0,-85,0));}
   return {g:g,lab:/เคลวิส/.test(t)?"ทิมเบิลเคลวิส":"กายทิมเบิล"};},
 sidewalkarm:function(t,D){var L=D.len||2500,g=G();g.add(at(cylX(30,L,M.galv,20),L/2,0,0));g.add(at(box(80,160,90,M.galv),0,0,0));var e=tor(25,7,M.galv);g.add(at(e,L+25,0,0));
   return {g:g,lab:"ท้าวแขนท่อ 2\" ยาว "+f(L)+" มม."};},
 guyguard:function(t,D){var L=D.len||2000,g=G();var s=new T.Shape();s.absarc(0,0,32,0,Math.PI*1.75);s.absarc(0,0,28,Math.PI*1.75,0,true);
   var m=new T.Mesh(new T.ExtrudeGeometry(s,{depth:L,bevelEnabled:false,curveSegments:28}),M.yellow);m.rotation.x=-Math.PI/2;g.add(m);return {g:g,lab:"กายการ์ด ยาว "+f(L)+" มม."};},
 uclamp:function(t,D){var d=D.d||8,g=G();var u=tor(d*4,d/2,M.galv,Math.PI);g.add(u);[-d*4,d*4].forEach(function(x){g.add(at(cyl(d/2,d/2,d*7,M.galv,14),x,-d*3.5,0));});
   g.add(at(box(d*11,d*1.2,d*3,M.galv),0,-d*5,0));return {g:g,lab:"ยูแคล้มป์ M"+d};},
 anchorplate:function(t,D){var a=D.a||550,c=D.c||150,g=G();g.add(at(box(a,c,a,M.conc),0,c/2,0));g.add(at(cyl(14,14,c+10,M.pvc,16),0,c/2,0));return {g:g,lab:"แผ่นสมอบก คสล. "+f(a)+"×"+f(a)+"×"+f(c)+" มม."};},
 gwclamp:function(t,D){var g=G();g.add(box(70,10,40,M.galv));var c=tor(14,4,M.galv,Math.PI);c.rotation.z=Math.PI;g.add(at(c,20,0,0));g.add(at(cyl(6,6,40,M.galv),-20,0,0));return {g:g,lab:"กราวด์วายร์แคล้มป์"};},
 wirecoil:function(t,D){var g=G(),r=(D.mm2?Math.sqrt(D.mm2/Math.PI):2)+.5,al=/อะลูมิเนียม/.test(t);var pts=[];for(var i=0;i<=160;i++){var u=i/160*Math.PI*8;pts.push([Math.cos(u)*150,i*.6,Math.sin(u)*150]);}
   g.add(tube(pts,r,al?M.alu:M.galv));return {g:g,lab:(al?"ลวดอะลูมิเนียม":"ลวดเหล็ก")+(D.mm2?" "+D.mm2+" ตร.มม.":""),note:"แสดงเป็นขด"};},
 conduit:function(t,D){var d=D.dia||20,L=Math.min(D.len||(D.b||4000),4000),g=G();var s=new T.Shape();s.absarc(0,0,d/2+1.5,0,Math.PI*2);var p=new T.Path();p.absarc(0,0,d/2,0,Math.PI*2,true);s.holes.push(p);
   var m=new T.Mesh(new T.ExtrudeGeometry(s,{depth:L,bevelEnabled:false,curveSegments:24}),M.lgrey);m.rotation.y=Math.PI/2;g.add(at(m,-L/2,0,0));return {g:g,lab:"ท่อ PVC แข็ง ø"+d+" ยาว "+f(L)+" มม."};},
 groundrod:function(t,D){var a=D.a||60,c=D.c||5,L=D.len||2000,g=G();var m=ext([[0,0],[a,0],[a,c],[c,c],[c,a],[0,a]],L,M.galv);m.rotation.x=-Math.PI/2;g.add(m);
   var tip=new T.Mesh(new T.ConeGeometry(a*.7,a*1.6,4),M.galv);tip.rotation.set(Math.PI,Math.PI/4,0);g.add(at(tip,a/3,-a*.8,-a/3));return {g:g,lab:"หลักดินเหล็กฉาก "+a+"×"+a+"×"+c+" มม. ยาว "+(L/1000)+" ม."};},
 linepost:function(t,D){var kv=D.kv||22,n=kv>=33?11:8,g=G(),comp=/COMPOSITE|คอมโพสิต/.test(D.row||"");sheds(g,n,32,comp?62:85,34,90,comp?M.poly:M.porc);
   g.add(at(cyl(40,40,80,M.galv,20),0,40,0));g.add(at(cyl(30,36,40,M.galv,20),0,90+n*34,0));var gr=box(70,24,40,M.galv);g.add(at(gr,0,120+n*34,0));
   return {g:g,lab:(comp?"ลูกถ้วยคอมโพสิต ":"ลูกถ้วยไลน์โพสท์ ")+kv+" kV",note:"แบบตั้ง (ไลน์โพสท์/พินโพสท์)"};},
 disc:function(t,D){var g=G(),n=(D.kv||22)>=33?3:2,comp=/COMPOSITE|คอมโพสิต/.test(D.row||"");
   if(comp){sheds(g,6,14,48,40,40,M.poly);g.add(at(cyl(12,12,40,M.galv),0,10,0));g.add(at(cyl(12,12,40,M.galv),0,300,0));return {g:g,lab:"ลูกถ้วยแขวนคอมโพสิต "+(D.kv||22)+" kV"};}
   for(var i=0;i<n;i++){var p=lathe([[0,0],[20,0],[24,-25],[125,-70],[127,-76],[78,-74],[50,-82],[28,-78],[12,-90],[0,-90]],M.porc,36);g.add(at(p,0,-i*146,0));g.add(at(cyl(28,32,32,M.galv),0,-i*146-4,0));}
   return {g:g,lab:"ลูกถ้วยแขวน "+(D.kv||22)+" kV",note:"แสดง "+n+" ลูกต่อชุด"};},
 spool:function(t,D){var g=G();g.add(cyl(38,38,75,M.porc,28));[-26,26].forEach(function(y){var r=tor(36,6,M.porc);r.rotation.x=Math.PI/2;g.add(at(r,0,y,0));});g.add(cyl(10,10,78,M.pvc,16));
   return {g:g,lab:"ลูกรอกแรงต่ำ (53-2)"};},
 spoolholder:function(t,D){var r=B.spool(t,D),g=r.g;g.add(at(box(8,100,90,M.galv),-50,0,0));g.add(at(box(100,8,90,M.galv),0,48,0));g.add(at(box(100,8,90,M.galv),0,-48,0));g.add(at(cyl(7,7,110,M.galv),0,0,0));
   return {g:g,lab:"ที่จับลูกรอกแรงต่ำ (พร้อมลูกรอก)"};},
 strainins:function(t,D){var g=G();var p=lathe([[0,-60],[30,-58],[42,-30],[45,0],[42,30],[30,58],[0,60]],M.porc,32);p.scale.set(1,1,.8);g.add(p);
   var a=tor(18,5,M.galv);a.rotation.y=Math.PI/2;g.add(at(a,0,40,0));var b=tor(18,5,M.galv);g.add(at(b,0,-40,0));return {g:g,lab:"ลูกถ้วยยึดโยง (สายยึดโยง)"};},
 rack:function(t,D){var g=G(),m=clean(t).match(/(\d)\s*x\s*(\d+)/),n=m?+m[1]:1,pitch=m?+m[2]:200,h=pitch*n+60;
   g.add(at(box(10,h,60,M.galv),-60,h/2,0));[0,h].forEach(function(y){g.add(at(box(120,10,60,M.galv),0,y,0));});
   for(var i=0;i<n;i++){var y=60+i*pitch;g.add(at(cyl(38,38,70,M.porc,24),20,y+30,0));[-22,22].forEach(function(dy){var r=tor(36,6,M.porc);r.rotation.x=Math.PI/2;g.add(at(r,20,y+30+dy,0));});}
   g.add(at(cyl(8,8,h,M.galv),20,h/2,0));return {g:g,lab:"แร็ค "+n+"×"+pitch+" มม.",note:"พร้อมลูกรอก"};},
 strainclamp:function(t,D){var g=G();var b=new T.Mesh(new T.CylinderGeometry(22,30,320,16,1,false,0,Math.PI),M.alu);b.rotation.z=Math.PI/2;g.add(b);
   [-60,20,100].forEach(function(x){var u=tor(16,5,M.galv,Math.PI);u.rotation.y=Math.PI/2;u.rotation.z=Math.PI;g.add(at(u,x,-4,0));});var c=box(60,24,40,M.alu);g.add(at(c,-185,0,0));
   return {g:g,lab:"สเตรนแคล้มป์แบบตรง",note:D.mm2?"สาย "+D.mm2+" ตร.มม.":""};},
 spacer:function(t,D){var g=G();var s=ext([[0,-170],[110,0],[0,170],[-110,0]],30,M.hdpe,[[0,120,22],[-60,-50,22],[60,-50,22],[0,-130,14]]);g.add(s);return {g:g,lab:"เคเบิลสเปเซอร์",note:"ช่องสายเคเบิลอากาศ 3 เส้น + เมสเซนเจอร์"};},
 hanger:function(t,D){var g=G();var h=tor(30,6,M.galv,Math.PI*1.5);g.add(h);g.add(at(box(14,90,30,M.galv),0,70,0));g.add(at(cylZ(5,40,M.galv),0,110,0));var c=tor(22,6,M.hdpe);c.rotation.x=Math.PI/2;g.add(at(c,0,-34,0));
   return {g:g,lab:/แคล้มป์/.test(t)?"แคล้มป์แขวนสายเคเบิล":"ที่แขวนสาย"};},
 termination:function(t,D){var kv=D.kv||22,g=G(),n=kv>=33?5:4;sheds(g,n,20,58,55,120,M.poly);g.add(at(cyl(16,16,140,M.pvc,20),0,40,0));g.add(at(cyl(10,10,60,M.cu,12),0,120+n*55+20,0));
   var lug=box(30,40,6,M.cu);g.add(at(lug,0,120+n*55+60,0));return {g:g,lab:"ชุดต่อปลายสายเคเบิลภายนอกอาคาร "+kv+" kV",note:D.mm2?"สาย "+(D.n||1)+"×"+D.mm2+" ตร.มม.":""};},
 helixrod:function(t,D){var g=G(),L=D.Ls||Math.max(580,(clean(t).match(/L\s*=\s*(\d+)/)||[0,580])[1]),r=(D.mm2?Math.sqrt(D.mm2/Math.PI)+2:6);g.add(at(cylX(r,L*1.1,M.pvc,16),L*.5,0,0));
   for(var k=0;k<6;k++){var pts=[];for(var i=0;i<=80;i++){var u=i/80,a=u*Math.PI*2*(L/180)+k*Math.PI/3;pts.push([u*L,Math.cos(a)*(r+2.5),Math.sin(a)*(r+2.5)]);}g.add(tube(pts,2,M.alu));}
   return {g:g,lab:/อาร์เมอร์/.test(t)?"ปรีฟอร์มอาร์เมอร์ร็อด":"ปรีฟอร์มไลน์การ์ด",note:"ยาวประมาณ "+f(L)+" มม."};},
 damper:function(t,D){var g=G(),L=1300,r=10;g.add(at(cylX(r,L*.9,M.pvc,16),L*.45,0,0));var pts=[];for(var i=0;i<=200;i++){var u=i/200,a=u*Math.PI*2*16;var R=u<.3?r+3:r+12;pts.push([u*L,Math.cos(a)*R,Math.sin(a)*R]);}g.add(tube(pts,4,M.hdpe));
   return {g:g,lab:"ไวเบรชั่นแดมเปอร์แบบสไปรอล"};},
 deadend:function(t,D){var g=G(),L=700,r=(D.mm2?Math.sqrt(D.mm2/Math.PI)+3:8),col=/แดง/.test(t)?M.red:(/เหลือง/.test(t)?M.yellow:(/เขียว/.test(t)?M.green:(/น้ำเงิน|ฟ้า/.test(t)?M.blue:M.alu)));
   [1,-1].forEach(function(s){var pts=[];for(var i=0;i<=90;i++){var u=i/90,a=u*Math.PI*2*5;pts.push([u*L,s*(r+14)*(1-u*.85)+Math.cos(a)*3,Math.sin(a)*(r+3)]);}g.add(tube(pts,3,M.alu));});
   var loop=tor(r+14,3.5,M.alu,Math.PI);loop.rotation.z=Math.PI/2;g.add(at(loop,0,0,0));g.add(at(box(40,6,6,col),L*.6,r+6,0));g.add(at(cylX(r,L*.9,M.pvc,16),L*.55,0,0));
   return {g:g,lab:"ปรีฟอร์มเข้าปลายสาย",note:(D.mm2?"สาย "+D.mm2+" ตร.มม. · ":"")+((clean(t).match(/รหัสสี\s*(สี\S+)/)||[0,""])[1])};},
 hotline:function(t,D){var g=G();g.add(box(60,20,30,M.cu));var e=tor(14,4,M.galv);g.add(at(e,0,40,0));g.add(at(cyl(6,6,70,M.galv),0,0,0));var j=box(40,14,30,M.cu);g.add(at(j,0,-25,0));return {g:g,lab:"ฮอทไลน์แคล้มป์"};},
 bail:function(t,D){var g=G();var b=tor(40,5,M.alu,Math.PI);b.rotation.z=Math.PI;g.add(b);g.add(at(box(110,20,30,M.alu),0,10,0));[-30,30].forEach(function(x){g.add(at(cyl(6,6,40,M.galv),x,22,0));});return {g:g,lab:"เบล (สเตอร์รัพ) แคล้มป์"};},
 pg:function(t,D){var n=/3 ตัว|TRIPLE/.test(t)?3:2,g=G(),L=n*30+20;[-9,9].forEach(function(y){g.add(at(box(L,14,46,M.alu),0,y,0));});
   [-14,14].forEach(function(z){g.add(at(cylX(5,L+80,M.pvc,14),0,0,z));});for(var i=0;i<n;i++){var x=-L/2+15+i*30;g.add(at(cyl(5,5,50,M.galv),x,0,0));var h=hexN(10,8,M.galv);g.add(at(h,x,20,0));}
   return {g:g,lab:"พี.จี. คอนเนคเตอร์ "+n+" สลัก"};},
 hconn:function(t,D){var g=G();g.add(ext([[-25,-30],[25,-30],[25,-5],[10,-5],[10,5],[25,5],[25,30],[-25,30],[-25,5],[-10,5],[-10,-5],[-25,-5]],45,M.cu));[-16,16].forEach(function(y){g.add(at(cylZ(5,140,M.pvc,14),0,y,22));});
   return {g:g,lab:"คอนเนคเตอร์ชนิดบีบ แบบเอช",note:"บีบด้วยคีม"};},
 deadendconn:function(t,D){var g=G();g.add(at(cylX(10,140,M.alu,16),70,0,0));var p=box(50,40,10,M.alu);g.add(at(p,-25,0,0));g.add(at(cylZ(6,12,M.pvc,12),-30,0,0));return {g:g,lab:"คอนเนคเตอร์เข้าปลายสาย"};},
 lug:function(t,D){var g=G(),r=(D.mm2?Math.sqrt(D.mm2/Math.PI)+3:8);g.add(at(cylX(r,60,M.alu,20),30,0,0));var p=ext([[-r*2,-r*1.4],[0,-r*1.4],[0,r*1.4],[-r*2,r*1.4]],r*.6,M.alu,[[-r*1.1,0,r*.45]]);g.add(at(p,0,0,-r*.3));
   return {g:g,lab:"หางปลา (NEMA)"+(D.mm2?" "+D.mm2+" ตร.มม.":"")};},
 ipc:function(t,D){var g=G();g.add(at(box(60,40,50,M.hdpe),0,22,0));g.add(at(box(60,40,50,M.hdpe),0,-22,0));[-1,1].forEach(function(s){g.add(at(cylX(8,160,M.pvc,14),0,s*6,s*12));});
   g.add(at(cyl(6,6,110,M.galv),0,0,0));var h=hexN(12,10,M.galv);g.add(at(h,0,60,0));return {g:g,lab:"ต่อแยกสายแรงต่ำแบบหุ้มฉนวน (IPC)"};},
 splice:function(t,D){var L=D.Ls||150,r=(D.mm2?Math.sqrt(D.mm2/Math.PI)+4:9),g=G();g.add(cylX(r,L,M.alu,24));[-1,1].forEach(function(s){g.add(at(cylX(r*.6,60,M.pvc,16),s*(L/2+30),0,0));});
   return {g:g,lab:"หลอดต่อสาย"+(/ไม่รับ/.test(t)?"ไม่รับ":"รับ")+"แรงดึง ยาว ≥ "+L+" มม.",note:D.mm2?"สาย "+D.mm2+" ตร.มม.":""};},
 /* สาย: แสดงท่อนสั้น ปลอกชั้นต่างๆ ให้เห็นภาคตัด */
 cablepiece:function(D,layers,lab,note,n){var g=G(),L=400,core=Math.sqrt((D.mm2||50)/Math.PI)+.5;n=n||1;
   var off=n===1?[[0,0]]:n===2?[[-core*1.2,0],[core*1.2,0]]:[[0,core*1.3],[-core*1.15,-core*.7],[core*1.15,-core*.7]];
   off.forEach(function(o,k){var r=core,x0=0;g.add(at(cylX(core,L+80,layers[0][1],18),x0+(L+80)/2-40,o[1],o[0]));
     layers.slice(1).forEach(function(ly,i){r+=ly[0];var len=L-i*30-(n>1?20:0);g.add(at(cylX(r,len,ly[1],24),len/2+i*15,o[1],o[0]));});});
   if(layers.outer){var R=core*(n>1?2.6:1)+layers.outer[0];g.add(at(cylX(R,L-120,layers.outer[1],28),(L-120)/2+80,0,0));}
   return {g:g,lab:lab,note:note};},
 bare:function(t,D){return B.cablepiece(D,[[0,M.alu]],"สายอะลูมิเนียมเปลือย "+(D.mm2||"")+" ตร.มม.","");},
 acsr:function(t,D){return B.cablepiece(D,[[0,M.galv],[Math.sqrt((D.mm2||50)/Math.PI)*.5,M.alu]],"สายอะลูมิเนียมแกนเหล็ก "+(D.mm2||"")+" ตร.มม.","แกนเหล็ก + อะลูมิเนียม");},
 inscable:function(t,D){return B.cablepiece(D,[[0,M.alu],[1.6,M.pvc]],"สายอะลูมิเนียมหุ้มฉนวน PVC "+(D.mm2||"")+" ตร.มม.","");},
 multicore:function(t,D){var L=B.cablepiece(D,[[0,M.cu],[1.2,M.white]],"สายทองแดงหุ้มฉนวน "+(D.n||2)+"×"+(D.mm2||"")+" ตร.มม.","ฉนวน XLPE + เปลือก PVC",D.n||2);var R=Math.sqrt((D.mm2||6)/Math.PI)*2.8+3;L.g.add(at(cylX(R,300,M.pvc,28),230,0,0));return L;},
 aerial:function(t,D){return B.cablepiece(D,[[0,M.alu],[1,M.dark],[3.4,M.hdpe]],"เคเบิลอากาศอะลูมิเนียม "+(D.kv||22)+" kV "+(D.mm2||"")+" ตร.มม.","ตัวนำ · ชีลด์ · ฉนวน XLPE");},
 ugcable:function(t,D){var n=D.n||1,hv=(D.kv||0)>=20||/22 kV|33 kV/.test(t);var r=B.cablepiece(D,hv?[[0,M.cu],[1,M.dark],[5.5,M.white],[1,M.cu]]:[[0,M.cu],[1.4,M.white]],
   "เคเบิลใต้ดินทองแดง "+(hv?(D.kv||22)+" kV ":"0.6/1 kV ")+(n>1?n+"×":"")+(D.mm2||"")+" ตร.มม.",hv?"ตัวนำ · ฉนวน XLPE · ชีลด์ทองแดง · เปลือก":"ฉนวน XLPE · เปลือก PVC",n);
   var R=Math.sqrt((D.mm2||35)/Math.PI)*(n>1?2.6:1)+(hv?10:4);r.g.add(at(cylX(R,260,M.pvc,28),240,0,0));return r;},
 twisted:function(t,D){var g=G(),L=600,core=Math.sqrt((D.mm2||50)/Math.PI)+6;for(var k=0;k<3;k++){var pts=[];for(var i=0;i<=60;i++){var u=i/60,a=u*Math.PI*2*1.2+k*Math.PI*2/3;pts.push([u*L,Math.cos(a)*core*1.2,Math.sin(a)*core*1.2]);}g.add(tube(pts,core,M.hdpe));}
   g.add(at(cylX(5,L+60,M.galv,12),L/2,0,0));return {g:g,lab:"เคเบิลอากาศพันเกลียว 3×"+(D.mm2||"")+" ตร.มม.",note:"พร้อมลวดแขวน"};},
 tape:function(t,D){var w=19,g=G();var s=new T.Shape();s.absarc(0,0,48,0,Math.PI*2);var p=new T.Path();p.absarc(0,0,19,0,Math.PI*2,true);s.holes.push(p);
   g.add(new T.Mesh(new T.ExtrudeGeometry(s,{depth:w,bevelEnabled:false,curveSegments:40}),M.pvc));var c=cylZ(19,w,M.white,32);g.add(at(c,0,0,w/2));g.add(at(box(60,.8,w,M.pvc),30,-48,w/2));
   return {g:g,lab:"เทปพันสายไฟฟ้า PVC"};},
 meter1:function(t,D,p3){var g=G(),W=p3?170:130,H=p3?250:180;g.add(at(box(W,H,110,M.white),0,H/2,0));g.add(at(box(W,60,110,M.grey),0,-30,0));g.add(at(box(W*.74,H*.38,4,M.glass),0,H*.66,56));
   g.add(at(box(W*.5,16,2,M.pvc),0,H*.7,55));if(!/สมาร์ท|SMART/.test(t)){var d=cylZ(30,2,M.dark,28);g.add(at(d,0,H*.52,55));}else{g.add(at(box(W*.5,30,2,M.green),0,H*.68,56));}
   for(var i=0;i<(p3?7:4);i++){g.add(at(cyl(5,5,60,M.pvc,12),-W*.36+i*(W*.72/((p3?7:4)-1)),-90,0));}
   return {g:g,lab:(/สมาร์ท|SMART/.test(t)?"สมาร์ทมิเตอร์":"วัตต์อาวร์มิเตอร์")+(p3?" 3 เฟส":" 1 เฟส")};},
 meter3:function(t,D){return B.meter1(t,D,true);},
 smartmeter:function(t,D){return B.meter1(t,D,/3 เฟส/.test(t));},
 meterplate:function(t,D){var a=D.b||200,b=D.c||200,c=D.a||20;if(D.a&&D.a>50){a=D.a;b=D.b;c=D.c;}var g=G();g.add(at(box(b,a,c,M.wood),0,a/2,0));[a*.12,a*.88].forEach(function(y){g.add(at(cylZ(5,c+2,M.pvc,12),0,y,0));});
   return {g:g,lab:"แป้นรองมิเตอร์ "+f(c)+"×"+f(a)+"×"+f(b)+" มม."};},
 cabinet:function(t,D){var g=G(),cb=/เบรคเกอร์/.test(t);g.add(at(box(cb?350:300,cb?450:820,250,cb?M.lgrey:M.grey),0,0,0));g.add(at(box((cb?350:300)-20,(cb?450:820)-30,6,M.steel),0,0,128));
   g.add(at(box(140,120,4,M.glass),0,cb?60:200,132));g.add(at(box(10,60,14,M.dark),cb?150:120,0,136));return {g:g,lab:cb?"เซอร์กิตเบรคเกอร์แรงต่ำพร้อมตู้":"ตู้มิเตอร์ อะลูมิเนียม/เหล็ก"};},
 vt:function(t,D){var g=G();g.add(at(box(260,320,220,M.tank),0,160,0));bushing(g,-70,320,0,180);bushing(g,70,320,0,180);g.add(at(box(80,60,30,M.dark),0,120,125));return {g:g,lab:"วี.ที. 1 เฟส ดับเบิลบุชชิ่ง",note:"ภายนอกอาคาร"};},
 ctwin:function(t,D){var g=G();var s=ext([[-55,-65],[55,-65],[55,65],[-55,65]],40,M.hdpe,[[0,0,30]]);g.add(s);g.add(at(box(30,20,20,M.dark),0,-75,20));return {g:g,lab:"ซี.ที. แรงต่ำ ชนิดหน้าต่าง",note:(clean(t).match(/เรโช\s*\S+/)||[""])[0]};},
 ctout:function(t,D){var kv=(clean(t).match(/(\d+)\s*kV/)||[0,22])[1],g=G();g.add(at(box(240,280,200,M.tank),0,140,0));bushing(g,0,280,0,+kv>=33?320:250);
   g.add(at(box(100,24,24,M.cu),0,280+(+kv>=33?330:260),0));return {g:g,lab:"ซี.ที. ใช้นอกอาคาร "+kv+" kV"};},
 fuseswitch:function(t,D){var g=G();g.add(box(160,260,90,M.hdpe));g.add(at(box(110,160,40,M.dark),0,0,62));g.add(at(box(60,24,30,M.red),0,100,80));[-50,50].forEach(function(y){g.add(at(cylZ(10,40,M.cu,12),40,y,-60));});
   return {g:g,lab:"ฟิวส์สวิตช์แรงต่ำ"};},
 hrc:function(t,D){var g=G();g.add(box(70,50,50,M.white));[-1,1].forEach(function(s){g.add(at(box(40,4,20,M.cu),s*55,0,0));g.add(at(box(10,40,40,M.cu),s*38,0,0));});
   return {g:g,lab:"เอชอาร์ซีฟิวส์แรงต่ำ"+(D.amp?" "+D.amp+" A":""),note:(clean(t).match(/รหัสสี\s*(สี\S+)/)||[0,""])[1]};},
 dbase:function(t,D){var g=G();g.add(at(box(50,25,70,M.white),0,0,0));g.add(at(cyl(17,17,40,M.wporc,24),0,32,0));return {g:g,lab:"ฐานฟิวส์ ดี-คาทริดจ์"};},
 dfuse:function(t,D){var g=G();g.add(lathe([[0,0],[11,0],[11,6],[13,8],[13,46],[9,50],[0,50]],M.wporc,28));g.add(at(cyl(5,5,4,M.red,16),0,52,0));return {g:g,lab:"ดี-คาทริดจ์ฟิวส์"+(D.amp?" "+D.amp+" A":"")};},
 cutout:function(t,D){var g=G(),kv=D.kv||22;var ins=G();sheds(ins,kv>=33?6:5,26,52,48,0,M.porc);ins.rotation.z=.32;g.add(ins);var tb=cyl(16,16,320,M.dark,16);tb.rotation.z=.32;g.add(at(tb,80,130,0));
   var br=box(24,24,200,M.galv);g.add(at(br,-50,130,0));return {g:g,lab:"ดรอพเอาต์ฟิวส์คัตเอาต์ "+kv+" kV"+(D.amp?" "+D.amp+" A":"")};},
 fuselink:function(t,D){var g=G();g.add(at(cyl(10,10,6,M.cu,20),0,0,0));g.add(at(cyl(4,4,120,M.red,14),0,-63,0));var pts=[[0,-120,0],[30,-200,10],[0,-300,0],[-25,-380,-10],[0,-460,0]];g.add(tube(pts,2,M.cu));
   return {g:g,lab:"ฟิวส์ลิงค์ "+(D.kv||22)+" kV",note:(D.amp?D.amp+" A ":"")+"แบบ K หรือ H"};},
 lvarr:function(t,D){var g=G();g.add(cyl(18,18,70,M.hdpe,20));[-1,1].forEach(function(s){g.add(tube([[0,s*35,0],[0,s*80,0],[s*20,s*120,0]],2.2,M.pvc));});return {g:g,lab:"กับดักเสิร์จแรงต่ำ"};},
 hvarr:function(t,D){var kv=(clean(t).match(/(\d+)\s*kV/)||[0,21])[1],g=G();sheds(g,+kv>=30?7:5,24,50,45,40,M.poly);g.add(at(cyl(16,16,20,M.galv),0,30,0));g.add(at(cyl(6,6,40,M.galv),0,40+((+kv>=30?7:5)-1)*45+30,0));
   var br=box(220,10,50,M.galv);g.add(at(br,-90,10,0));return {g:g,lab:"กับดักเสิร์จแรงสูง "+kv+" kV",note:"พร้อมขายึด"};},
 animal:function(t,D){var g=G();g.add(lathe([[0,0],[90,-8],[100,-14],[96,-18],[0,-6]],M.hdpe,36));g.add(at(cyl(26,26,30,M.hdpe,24),0,10,0));return {g:g,lab:"ชุดป้องกันสัตว์"};},
 powerfuse:function(t,D){var g=G();g.add(at(box(600,24,80,M.galv),0,0,0));[-220,220].forEach(function(x){var s=G();sheds(s,5,26,52,46,0,M.porc);g.add(at(s,x,12,0));});var tb=cylX(26,420,M.dark,20);g.add(at(tb,0,280,0));
   return {g:g,lab:/ชนิด อี|TYPE E/.test(t)?"ฟิวส์ชนิด อี":"ชุดเพาเวอร์ฟิวส์",note:(D.kv||22)+" kV"+(D.amp?" "+D.amp+" A":"")};},
 sf6:function(t,D){var g=G();g.add(at(box(900,500,520,M.tank),0,250,0));[-280,0,280].forEach(function(x){bushing(g,x,500,-120,220,M.poly);bushing(g,x,500,120,220,M.poly);});g.add(at(box(40,40,160,M.dark),480,300,0));
   return {g:g,lab:"สวิตช์ SF6 3 เฟส "+(D.kv||22)+" kV",note:"เปิดได้เมื่อมีโหลด"};},
 disconnect:function(t,D){var g=G(),kv=D.kv||22;g.add(at(box(560,40,60,M.galv),0,0,0));[-200,200].forEach(function(x){var s=G();sheds(s,kv>=33?6:5,26,52,46,20,M.porc);g.add(at(s,x,20,0));});
   var bl=box(440,10,30,M.cu);bl.rotation.z=.08;g.add(at(bl,0,(kv>=33?6:5)*46+40,0));var e=tor(16,4,M.galv);g.add(at(e,-215,(kv>=33?6:5)*46+60,0));return {g:g,lab:"สวิตช์ตัดตอนแรงสูงหนึ่งขา "+kv+" kV"};},
 recloser:function(t,D){var g=G();g.add(at(box(700,520,420,M.tank),0,260,0));[-220,0,220].forEach(function(x){bushing(g,x,520,-100,260,M.poly);bushing(g,x,520,100,260,M.poly);});g.add(at(box(40,180,40,M.dark),380,240,0));
   return {g:g,lab:"รีโคลสเซอร์ 3 เฟส "+(D.kv||22)+" kV"};},
 tankclamp:function(t,D){var g=G();g.add(ext([[0,0],[120,0],[120,10],[10,10],[10,60],[0,60]],40,M.galv,[]));g.add(at(cyl(6,6,70,M.galv),60,30,20));return {g:g,lab:"เหล็กจับขอบถังหม้อแปลง"};},
 tr:function(t,D,ph){var kva=D.kva||(ph===1?30:100),s=Math.cbrt(kva/100),g=G(),R=(ph===1?190:240)*s+80,H=(ph===1?560:720)*s+200;
   g.add(at(cyl(R,R,H,M.tank,40),0,H/2,0));g.add(at(cyl(R+8,R+8,20,M.tank,40),0,H+10,0));var nf=ph===1?8:14;for(var i=0;i<nf;i++){var a=i/nf*Math.PI*2;var fn=box(6,H*.75,70*s+30,M.tank);fn.position.set(Math.cos(a)*(R+30*s+12),H*.45,Math.sin(a)*(R+30*s+12));fn.rotation.y=-a;g.add(fn);}
   var hv=ph===1?(/22/.test(t)?1:1):3;for(var k=0;k<hv;k++){var x=hv===1?0:(k-1)*R*.55;bushing(g,x,H+20,-R*.3,200);}
   var lv=ph===1?3:4;for(var j=0;j<lv;j++){var lb=cyl(14,18,70,M.porc,16);lb.rotation.x=Math.PI/2;g.add(at(lb,(j-(lv-1)/2)*R*.35,H*.82,R+30));}
   g.add(at(box(60,H*.8,40,M.galv),0,H*.45,-R-20));return {g:g,lab:"หม้อแปลง "+(ph===1?"1":"3")+" เฟส "+kva+" kVA",note:"ขนาดถังประมาณตาม kVA"};},
 tr1:function(t,D){return B.tr(t,D,1);},
 tr3:function(t,D){return B.tr(t,D,3);},
 capacitor:function(t,D){var g=G(),two=/สองบุชชิ่ง/.test(t);g.add(at(box(340,520,160,M.lgrey),0,260,0));(two?[-80,80]:[0]).forEach(function(x){bushing(g,x,520,0,200);});g.add(at(box(380,14,40,M.galv),0,420,0));
   return {g:g,lab:"คะแปซิเตอร์ 1 เฟส "+(two?"สอง":"หนึ่ง")+"บุชชิ่ง",note:(clean(t).match(/(\d+)\s*กิโลวาร์/)||[0,""])[1]?((clean(t).match(/(\d+)\s*กิโลวาร์/))[1]+" kVAr"):""};},
 caphanger:function(t,D){var m=clean(t).match(/1\s*x\s*(\d)/),n=m?+m[1]:3,g=G(),W=n*400;g.add(at(box(W,60,60,M.galv),0,0,0));g.add(at(box(W,60,60,M.galv),0,-500,0));
   for(var i=0;i<=n;i++){g.add(at(box(40,500,40,M.galv),-W/2+i*W/n,-250,0));}return {g:g,lab:"ที่แขวนคะแปซิเตอร์ 1×"+n+" ชุด"};},
 pipehanger:function(t,D){var g=G();var r=tor(32,4,M.galv,Math.PI*1.6);g.add(r);g.add(at(box(14,120,30,M.galv),0,90,0));return {g:g,lab:"เหล็กแขวนท่อ PVC"};},
 photocell:function(t,D){var g=G();g.add(lathe([[0,0],[42,0],[42,40],[36,70],[0,82]],M.hdpe,32));g.add(at(box(30,24,4,M.glass),0,55,30));for(var i=0;i<3;i++){var a=i/3*Math.PI*2;g.add(at(box(6,20,3,M.cu),Math.cos(a)*18,-10,Math.sin(a)*18));}
   return {g:g,lab:"สวิตช์ควบคุมไฟถนนชนิดพลังแสง"};},
 fluor:function(t,D){var n=(clean(t).match(/(\d)\s*x\s*(\d+)\s*วัตต์/)||[0,2,36]),g=G(),L=+n[2]>=36?1250:650;g.add(at(box(L,40,90+40*(n[1]-1),M.white),0,30,0));
   for(var i=0;i<+n[1];i++){g.add(at(cylX(13,L-40,M.white,16),0,0,(i-(n[1]-1)/2)*45));}return {g:g,lab:"โคมฟลูออเรสเซนต์ "+n[1]+"×"+n[2]+" W"};},
 ledlight:function(t,D){var g=G();var s=ext([[0,-120],[380,-150],[460,-110],[460,110],[380,150],[0,120]],50,M.lgrey,[]);s.rotation.x=-Math.PI/2;g.add(s);g.add(at(box(300,4,180,M.glass),260,-2,0));g.add(at(cylX(25,160,M.galv,16),-80,25,0));
   return {g:g,lab:"โคมไฟถนน LED"};},
 lamparm:function(t,D){var L=D.len||2500,g=G();var pts=[[0,0,0],[0,600,0],[150,900,0],[L*.5,1100,0],[L,1150,0]];g.add(tube(pts,24,M.galv));g.add(at(box(120,200,90,M.galv),0,100,0));return {g:g,lab:"กิ่งโคมไฟถนน ยาว "+f(L)+" มม."};}
};

/* ---------- สร้างโมเดลของรายการ+แถวที่เลือก ---------- */
function model(it,ri){var k=type(it);if(!k||!B[k])return null;var row=(it.rows[ri||0]||[]);var txt=clean((row[1]||"")+" "+(it.th||"")+" "+(it.en||""));
  var D=dims((row[1]||"")+" "+((it.rows.length===1)?(it.th+" "+it.en):""));var D2=dims(txt);Object.keys(D2).forEach(function(x){if(D[x]==null)D[x]=D2[x];});
  D.row=clean(row[1]||"");var r=B[k](txt,D);r.k=k;return r;}
function center(g){var inner=G();inner.add(g);var bb=new T.Box3().setFromObject(inner),c=bb.getCenter(new T.Vector3()),s=bb.getSize(new T.Vector3());inner.position.sub(c);var root=G();root.add(inner);return {root:root,size:s};}

/* ---------- ตัวแสดง 3D (ลากหมุน ซูม) ---------- */
var V=null;
function viewer(){ if(V) return V; var R=new T.WebGLRenderer({antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setClearColor(0,0);
  var sc=new T.Scene(),cam=new T.PerspectiveCamera(30,1,1,1e7);sc.add(new T.HemisphereLight(0xffffff,0x5a6470,.85));var d=new T.DirectionalLight(0xffffff,.85);d.position.set(1,1.4,1.2);sc.add(d);var d2=new T.DirectionalLight(0xffffff,.3);d2.position.set(-1,-.4,-1);sc.add(d2);
  V={R:R,sc:sc,cam:cam,root:null,rx:.38,ry:-.6,dist:1,auto:true,raf:0,host:null,size:1};var el=R.domElement,drag=0,px=0,py=0,pts={};
  el.style.touchAction="none";
  el.addEventListener("pointerdown",function(e){pts[e.pointerId]=[e.clientX,e.clientY];drag=1;V.auto=false;px=e.clientX;py=e.clientY;el.setPointerCapture(e.pointerId);});
  el.addEventListener("pointermove",function(e){if(!drag)return;var ids=Object.keys(pts);if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]],d0=Math.hypot(a[0]-b[0],a[1]-b[1]);pts[e.pointerId]=[e.clientX,e.clientY];a=pts[ids[0]];b=pts[ids[1]];var d1=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d0&&d1)V.dist=Math.max(.35,Math.min(3,V.dist*d0/d1));return;}
    V.ry+=(e.clientX-px)*.01;V.rx+=(e.clientY-py)*.01;V.rx=Math.max(-1.5,Math.min(1.5,V.rx));px=e.clientX;py=e.clientY;});
  var up=function(e){delete pts[e.pointerId];if(!Object.keys(pts).length)drag=0;};el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  el.addEventListener("wheel",function(e){e.preventDefault();V.dist*=1+e.deltaY*.001;V.dist=Math.max(.35,Math.min(3,V.dist));},{passive:false});
  return V; }
function loop(){V.raf=requestAnimationFrame(loop);if(!V.host||!V.host.isConnected){stop();return;}var w=V.host.clientWidth,h=V.host.clientHeight;if(w&&h&&(w!==V.w||h!==V.h)){V.w=w;V.h=h;V.R.setSize(w,h,false);V.cam.aspect=w/h;V.cam.updateProjectionMatrix();}
  if(V.auto)V.ry+=.004;V.root.rotation.set(V.rx,V.ry,0);V.cam.position.set(0,0,V.size*2.1*V.dist);V.cam.lookAt(0,0,0);V.R.render(V.sc,V.cam);}
function stop(){if(V){cancelAnimationFrame(V.raf);V.raf=0;}}
function mount(el,it,ri){return three().then(function(t3){T=t3;mats();var r=model(it,ri);if(!r)throw new Error("ยังไม่มีแบบจำลองของรายการนี้");viewer();stop();
  if(V.root)V.sc.remove(V.root);var c=center(r.g);V.root=c.root;V.size=Math.max(c.size.x,c.size.y,c.size.z);V.sc.add(V.root);V.rx=.38;V.ry=-.6;V.dist=1;V.auto=true;V.w=0;
  var cv=el.querySelector("canvas");if(cv!==V.R.domElement){el.querySelectorAll("canvas").forEach(function(x){x.remove();});el.insertBefore(V.R.domElement,el.firstChild);}
  V.R.domElement.style.width="100%";V.R.domElement.style.height="100%";V.R.domElement.style.display="block";V.host=el;loop();return r;});}

/* ---------- 2D: ภาพฉาย 3 ด้าน (เส้นขอบ + ขนาดรวม) ---------- */
var R2=null;
function draw2d(it,ri,W,H){return three().then(function(t3){T=t3;mats();var r=model(it,ri);if(!r)throw new Error("ยังไม่มีแบบจำลองของรายการนี้");
  W=W||420;H=H||300;if(!R2){R2=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R2.setPixelRatio(1);}R2.setSize(W,H,false);R2.setClearColor(0xffffff,1);
  var out={lab:r.lab,note:r.note,views:[]};
  ["front","side","top"].forEach(function(dir){var rr=model(it,ri),c=center(rr.g),sz=c.size,sc=new T.Scene();
    var white=new T.MeshBasicMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
    var dd={front:[sz.x,sz.y],side:[sz.z,sz.y],top:[sz.x,sz.z]}[dir],pad=1.3,asp=W/H,hw=dd[0]/2*pad,hh=dd[1]/2*pad;if(hw/hh>asp)hh=hw/asp;else hw=hh*asp;
    var cam=new T.OrthographicCamera(-hw,hw,hh,-hh,-1e7,1e7),D=Math.max(sz.x,sz.y,sz.z)*3;
    if(dir==="front")cam.position.set(0,0,D);if(dir==="side")cam.position.set(D,0,0);if(dir==="top"){cam.position.set(0,D,0);cam.up.set(0,0,-1);}cam.lookAt(0,0,0);
    var th=1.4*(2*hw/W),blk=new T.MeshBasicMaterial({color:0x1b2430,side:T.BackSide}),ms=[];c.root.updateMatrixWorld(true);
    c.root.traverse(function(o){if(o.isMesh)ms.push(o);});
    ms.forEach(function(o){o.material=white;o.add(new T.LineSegments(new T.EdgesGeometry(o.geometry,25),new T.LineBasicMaterial({color:0x1b2430})));
      o.geometry.computeBoundingSphere();var sp=o.geometry.boundingSphere,ws=new T.Vector3();o.getWorldScale(ws);var rad=Math.max(1e-3,sp.radius*Math.max(ws.x,ws.y,ws.z)),k=1+th/rad;
      var h=new T.Mesh(o.geometry,blk);h.position.copy(sp.center).multiplyScalar(1-k);h.scale.setScalar(k);o.add(h);});
    sc.add(c.root);R2.render(sc,cam);
    var bw=dd[0]/(2*hw)*W,bh=dd[1]/(2*hh)*H;out.views.push({dir:dir,img:R2.domElement.toDataURL("image/png"),w:Math.round(dd[0]),h:Math.round(dd[1]),bx:(W-bw)/2,by:(H-bh)/2,bw:bw,bh:bh,W:W,H:H});
    ms.forEach(function(o){o.geometry.dispose&&0;});});
  return out;});}

window.SPEC3D={type:type,mount:mount,draw2d:draw2d,stop:stop,dims:dims,_rules:RULES};
})();
