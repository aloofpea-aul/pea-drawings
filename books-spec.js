/* books-spec.js — ข้อมูลอุปกรณ์จาก "คู่มืออุปกรณ์ไฟฟ้าสำหรับการก่อสร้างระบบจำหน่ายแรงสูงและแรงต่ำ (2565)"
   ไฟล์ books-spec.bin เข้ารหัส (AES-GCM) กุญแจขอจากหลังบ้านเฉพาะผู้มีสิทธิ์คลังแบบ
   - PEASpec.key()  -> กุญแจ (เก็บในเครื่อง 7 วัน ผูกกับชื่อผู้ใช้)
   - PEASpec.load() -> {items:[...], byMat:{เลขวัสดุ:[item,row]}}
   - ในหน้าแบบ (มี #blnPop): ต่อกล่อง "จากคู่มืออุปกรณ์ไฟฟ้า 2565" ใต้รายการวัสดุที่กด */
(function(){
  var GAS=localStorage.getItem("sld_gas_url")||"https://script.google.com/macros/s/AKfycbzqsOqJJQlF4SS1UX_YM6hmhd3lUXCVocAJiK7l28Tzddms9SQ9Z7p-iYgrrgd2B2meWw/exec";
  var BASE=(document.currentScript&&document.currentScript.src||location.href).replace(/[^\/]*$/,"");
  var BOOK3="1lg1NY7WFlfyQF4i7pufsMYcdN8DVhEeo", KC="pea_books_key", DAY=864e5;
  var keyP=null, dataP=null;
  function user(){return localStorage.getItem("pea_aoluek_username")||"";}
  function key(){
    if(keyP) return keyP;
    keyP=(function(){
      try{var c=JSON.parse(localStorage.getItem(KC)||"null");if(c&&c.u===user()&&c.t>Date.now()-7*DAY&&c.k)return Promise.resolve(c.k);}catch(e){}
      return fetch(GAS,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify({action:"booksKey",changedBy:user(),changedByPassword:localStorage.getItem("pea_aoluek_password")||""})})
        .then(function(r){return r.json();}).then(function(r){
          if(!r||!r.ok||!r.key) throw new Error((r&&(r.error||r.message))||"ไม่ได้รับสิทธิ์");
          try{localStorage.setItem(KC,JSON.stringify({u:user(),t:Date.now(),k:r.key}));}catch(e){}
          return r.key;});
    })();
    keyP.catch(function(){keyP=null;});
    return keyP;
  }
  function decrypt(file,k){
    return fetch(BASE+file,{cache:"no-cache"}).then(function(x){if(!x.ok)throw new Error("ยังไม่มีไฟล์ข้อมูล");return x.arrayBuffer();}).then(function(ab){
      var buf=new Uint8Array(ab);
      return crypto.subtle.importKey("raw",Uint8Array.from(atob(k),function(c){return c.charCodeAt(0);}),"AES-GCM",false,["decrypt"])
        .then(function(ck){return crypto.subtle.decrypt({name:"AES-GCM",iv:buf.slice(0,12)},ck,buf.slice(12));});
    }).then(function(gz){return new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))).text();})
      .then(JSON.parse);
  }
  function load(){
    if(dataP) return dataP;
    dataP=key().then(function(k){return decrypt("books-spec.bin",k).catch(function(e){
      if(e&&e.name==="OperationError"){try{localStorage.removeItem(KC);}catch(_){}} throw e;});})
      .then(function(d){d.byMat={};d.items.forEach(function(it){it.rows.forEach(function(r){if(r[2]&&!d.byMat[r[2]])d.byMat[r[2]]=[it,r];});});return d;});
    dataP.catch(function(){dataP=null;});
    return dataP;
  }
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
  window.PEASpec={key:key,load:load,decrypt:decrypt,BOOK3:BOOK3,esc:esc};

  /* ---------- หน้าแบบ: เสริมกล่องสเปกในป๊อปอัปรายการวัสดุ ---------- */
  var pop=document.getElementById("blnPop"); if(!pop) return;
  var here=(location.pathname.split("/").pop()||"");
  function box(it,row,mat){
    var other=it.rows.length>1?'<div style="font-size:12px;color:#5a6573">มีในคู่มือ '+it.rows.length+' ขนาด/รุ่น</div>':"";
    return '<div class="bk-spec" style="margin:10px 0 4px;border:1px solid #d9c3d4;background:#f6e9f3;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;font-family:inherit;color:#18212b">'
      +'<div style="font-size:12px;font-weight:700;color:#7a1e6b">จากคู่มืออุปกรณ์ไฟฟ้า 2565 · หน้า '+esc(it.bp||it.p)+'</div>'
      +'<div style="font-size:13px">'+esc(it.th)+(it.en?' · <span style="color:#5a6573">'+esc(it.en)+'</span>':"")+'</div>'
      +'<div style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 10px;font-size:13px">'
      +(row[1]?'<span style="color:#5a6573">ขนาด/รุ่น</span><span>'+esc(row[1])+'</span>':"")
      +'<span style="color:#5a6573">วัสดุเลขที่</span><span>'+esc(mat)+'</span>'
      +(it.s?'<span style="color:#5a6573">การจัดเก็บ</span><span>'+esc(it.s)+'</span>':"")+'</div>'+other
      +(it.u.length?'<div style="font-size:13px;line-height:1.6">'+it.u.map(esc).join(" · ")+'</div>':"")
      +(it.d.length?'<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span style="font-size:12px;color:#5a6573">แบบที่ใช้ชิ้นนี้:</span>'
        +it.d.map(function(x){return x[1]&&x[1]!==here?'<a href="'+esc(x[1])+'" style="font-size:13px;padding:3px 10px;border-radius:14px;background:#fff;border:1px solid #cdd4dc;text-decoration:none;color:#245f93">'+esc(x[0])+'</a>'
          :'<span style="font-size:13px;padding:3px 10px;border-radius:14px;border:1px solid #e3e7ec;color:#5a6573">'+esc(x[0])+(x[1]?" (หน้านี้)":"")+'</span>';}).join("")+'</div>':"")
      +((it.b||[]).filter(function(x){return x[1]!==here;}).length?'<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span style="font-size:12px;color:#5a6573">แบบอื่นที่ใช้เลขวัสดุนี้:</span>'
        +it.b.filter(function(x){return x[1]!==here;}).slice(0,6).map(function(x){return '<a href="'+esc(x[1])+'" style="font-size:13px;padding:3px 10px;border-radius:14px;background:#fff;border:1px solid #cdd4dc;text-decoration:none;color:#245f93">'+esc(x[0])+'</a>';}).join("")+'</div>':"")
      +'<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:13px">'
      +'<a href="https://drive.google.com/file/d/'+BOOK3+'/view" target="_blank" rel="noopener" style="color:#245f93">เปิดคู่มือใน Drive (ดูหน้า '+esc(it.bp||it.p)+')</a>'
      +'<a href="../books.html?spec='+encodeURIComponent(mat)+'" style="color:#245f93">รายการอุปกรณ์ทั้งเล่ม</a></div></div>';
  }
  function matsIn(){
    var dts=pop.querySelectorAll("dt");
    for(var i=0;i<dts.length;i++) if(/วัสดุเลขที่/.test(dts[i].textContent)){var dd=dts[i].nextElementSibling;return (dd&&dd.textContent.match(/\d{10}/g))||[];}
    return [];
  }
  var busy=false;
  function enrich(){
    if(busy||pop.style.display!=="block"||pop.querySelector(".bk-spec")) return;
    var ms=matsIn(); if(!ms.length) return;
    load().then(function(d){
      if(pop.style.display!=="block"||pop.querySelector(".bk-spec")) return;
      var now=matsIn(); if(now.join()!==ms.join()) return;
      for(var i=0;i<ms.length;i++){var h=d.byMat[ms[i]]; if(h){
        var ft=pop.querySelector(".ft"); var w=document.createElement("div"); w.innerHTML=box(h[0],h[1],ms[i]);
        busy=true; if(ft) pop.insertBefore(w.firstChild,ft); else pop.appendChild(w.firstChild); busy=false;
        if(window.blnPlace) window.blnPlace(); return;}}
    }).catch(function(){});
  }
  new MutationObserver(enrich).observe(pop,{childList:true,attributes:true,attributeFilter:["style"]});
  /* โหลดล่วงหน้าตอนว่าง เพื่อให้กดแล้วขึ้นทันที */
  setTimeout(function(){ if(user()) load().catch(function(){}); },1500);
})();
