/* books-ref.js — กล่อง "หนังสืออ้างอิง" ท้ายหน้าแบบ: หาหมวดของแบบจากเลขแบบในชื่อหน้า แล้วแสดงหนังสือที่เกี่ยวข้อง */
(function(){
  /* สเปกจากคู่มืออุปกรณ์ 2565 ในป๊อปอัปรายการวัสดุ */
  var sp=document.createElement('script'); sp.src='../books-spec.js'; sp.defer=true; document.head.appendChild(sp);
  var m=(document.title||'').match(/^\s*(\d{4})/); if(!m) return;
  var num=parseInt(m[1],10);
  var CODES=[100,200,300,400,500,600,700,800,900,3100,3200,3300,3400,3500,3600,3700,3800,3900,5100,5200,5250,5300,5350,5400,5425,5600,5625,5635,5650,5660,5700,5800,5900];
  var thousand=Math.floor(num/1000), best=null;
  CODES.forEach(function(c){ if(Math.floor(c/1000)===thousand && c<=num && (best===null||c>best)) best=c; });
  if(best===null) return;
  var code='A'+String(best).padStart(4,'0');
  fetch('../books.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(B){
    var L=B.filter(function(b){return b.r.indexOf(code)>=0;}); if(!L.length) return;
    var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
    var box=document.createElement('section');
    box.setAttribute('aria-label','หนังสืออ้างอิง');
    box.style.cssText='max-width:1100px;margin:24px auto 72px;padding:14px 16px;border:1px solid #cdd4dc;border-radius:12px;background:#fff;color:#18212b;font-family:"IBM Plex Sans Thai",system-ui,sans-serif';
    box.innerHTML='<div style="font-weight:600;margin-bottom:8px">หนังสืออ้างอิง <span style="font-weight:400;color:#5a6573;font-size:13px">· หมวด '+code+' · '+L.length+' เล่ม</span></div>'+
      L.map(function(b){return '<a href="../books.html?n='+b.n+'" style="display:block;padding:8px 0;border-top:1px solid #eef1f4;color:#245f93;text-decoration:none;line-height:1.5">'+esc(b.t)+' <span style="color:#5a6573;font-size:12px">('+esc(b.y)+')</span></a>';}).join('');
    document.body.appendChild(box);
  }).catch(function(){});
})();
