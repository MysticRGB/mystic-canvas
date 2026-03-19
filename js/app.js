// ── Global API helper ──
window.API = {
  async sql(query) {
    try {
      const r = await fetch('/api/sql?q=' + encodeURIComponent(query));
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },
  async falUsage(start) {
    try {
      const r = await fetch('/api/fal-usage?start=' + encodeURIComponent(start));
      return await r.json();
    } catch { return { time_series: [] }; }
  },
  async usdRate() {
    try {
      const r = await fetch('/api/usd-rate');
      const d = await r.json();
      return d.rate || 83;
    } catch { return 83; }
  },
  async session() {
    try {
      const r = await fetch('/api/session');
      return await r.json();
    } catch { return null; }
  },
  async crons() {
    try {
      const r = await fetch('/api/crons');
      return await r.json();
    } catch { return []; }
  },
  async memohBots() {
    try {
      const r = await fetch('/api/memoh-bots');
      return await r.json();
    } catch { return null; }
  },
  async serverStats() {
    try {
      const r = await fetch('/api/server-stats');
      return await r.json();
    } catch { return { totalRamGB: 96, usedRamGB: 0 }; }
  }
};

// ── Date helpers ──
window.MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
window.fmtDate = function(d) {
  var dt = new Date(d);
  return dt.getDate() + ' ' + MONTHS[dt.getMonth()];
};
window.daysLeft = function(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

// ── Tabs ──
var cur = 0;
var tabs = document.querySelectorAll('.tb');
var slider = document.getElementById('slider');

window.sw = function(i) {
  cur = i;
  slider.style.transform = 'translateX(-' + i * 100 + 'vw)';
  tabs.forEach(function(t, j) { t.classList.toggle('on', j === i); });
};

// Swipe support
var sx = 0, sy = 0, moving = false;
document.addEventListener('touchstart', function(e) {
  sx = e.touches[0].clientX; sy = e.touches[0].clientY; moving = true;
}, { passive: true });
document.addEventListener('touchend', function(e) {
  if (!moving) return; moving = false;
  var dx = e.changedTouches[0].clientX - sx;
  var dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0 && cur < 2) sw(cur + 1);
    else if (dx > 0 && cur > 0) sw(cur - 1);
  }
}, { passive: true });

// ── SPLASH: А → AI → AI МИСТИК → AI MYSTIC → dismiss ──
(function(){
  var FULL=[
    {ch:'А',ff:"'Grafita Special',sans-serif"},
    {ch:'I',ff:"'Grafita',sans-serif"},
    {ch:' ',ff:"sans-serif"},
    {ch:'М',ff:"'Grafita Special','Grafita',sans-serif"},
    {ch:'И',ff:"'Grafita Special','Grafita',sans-serif"},
    {ch:'С',ff:"'Grafita Special','Grafita',sans-serif"},
    {ch:'T',ff:"'Grafita',sans-serif"},
    {ch:'И',ff:"'Grafita Special','Grafita',sans-serif"},
    {ch:'К',ff:"'Grafita Special','Grafita',sans-serif"}
  ];
  var EN=['A','I',' ','M','Y','S','T','I','C'];
  var G=['#','@','/','*','&','△','◇'];
  var CR='rgba(255,255,255,0.95)',CE='rgba(214,190,159,0.92)',CG='rgba(214,190,159,0.3)';
  var c=document.getElementById('sp-t');
  var spans=[];

  function mkSpan(item,hidden){
    var s=document.createElement('span');
    s.textContent=item.ch;
    if(item.ch===' '){
      s.style.cssText="display:inline-block;width:16px;flex-shrink:0";
      if(hidden){s.style.width='0';s.style.overflow='hidden';s.style.transition='width 0.3s ease';}
    } else {
      s.style.cssText="display:inline-flex;align-items:center;justify-content:center;font-family:"+item.ff+";transition:opacity 0.2s ease,color 0.3s ease;color:"+CR+";opacity:"+(hidden?'0':'1');
    }
    c.appendChild(s);
    spans.push(s);
    return s;
  }

  function glitchIn(s,ch,delay,cb){
    setTimeout(function(){
      s.style.opacity='0.15';s.style.color=CG;
      s.textContent=G[Math.floor(Math.random()*G.length)];
      setTimeout(function(){
        s.textContent=G[Math.floor(Math.random()*G.length)];
        setTimeout(function(){
          s.textContent=ch;s.style.color=CR;s.style.opacity='1';
          if(cb)cb();
        },80);
      },100);
    },delay);
  }

  function waveTo(done){
    var ord=[];for(var i=0;i<spans.length;i++)if(i!==2)ord.push(i);
    ord.sort(function(){return Math.random()-0.5;});
    var mx=0;
    ord.forEach(function(idx,step){
      var d=step*(90+Math.floor(Math.random()*70));if(d>mx)mx=d;
      setTimeout(function(){
        var s=spans[idx],tgt=EN[idx];
        s.style.opacity='0.05';s.style.color=CG;
        setTimeout(function(){
          s.textContent=G[Math.floor(Math.random()*G.length)];
          setTimeout(function(){s.textContent=tgt;s.style.color=CE;s.style.opacity='1';},75);
        },120);
      },d);
    });
    setTimeout(done,mx+280);
  }

  function dismiss(){
    var sp=document.getElementById('splash');
    sp.style.transition='opacity 0.6s ease';
    sp.style.opacity='0';sp.style.pointerEvents='none';
    slider.style.transition='opacity 0.6s ease';
    slider.style.opacity='1';
    document.getElementById('tabbar').style.opacity='1';
    setTimeout(function(){sp.style.display='none';slider.style.transition='transform .3s cubic-bezier(.4,0,.2,1)';},650);
  }

  document.fonts.ready.then(function(){
    FULL.forEach(function(item,i){mkSpan(item,i>0);});

    var totalW=0;
    spans.forEach(function(s,i){
      if(FULL[i].ch===' ') return;
      var wRu=s.getBoundingClientRect().width;
      s.textContent=EN[i];
      var wEn=s.getBoundingClientRect().width;
      s.textContent=FULL[i].ch;
      var w=Math.ceil(Math.max(wRu,wEn));
      s.style.width=w+'px';
      totalW+=w;
    });
    totalW+=16;

    var aW=spans[0].getBoundingClientRect().width;
    var shift=(totalW-aW)/2;
    c.style.transition='none';
    c.style.transform='translateX('+shift+'px)';
    c.offsetHeight;

    setTimeout(function(){
      c.style.transition='transform 0.6s cubic-bezier(.4,0,.2,1)';
      c.style.transform='translateX(0)';
      setTimeout(function(){
        glitchIn(spans[1],'I',0,function(){
          setTimeout(function(){
            spans[2].style.width='16px';
            [3,4,5,6,7,8].forEach(function(idx,step){
              glitchIn(spans[idx],FULL[idx].ch,step*110);
            });
            setTimeout(function(){
              waveTo(function(){setTimeout(dismiss,400);});
            },6*110+350);
          },180);
        });
      },500);
    },550);
  });
})();

// ── Init all tabs ──
window.addEventListener('DOMContentLoaded', async function() {
  // Pre-fetch USD rate
  window.USD_RUB = await API.usdRate();
  window.rub = function(usd) { return Math.round(usd * window.USD_RUB); };
  window.rubFmt = function(usd) { return rub(usd).toLocaleString('ru-RU'); };

  // Load all tabs in parallel
  Promise.all([
    typeof buildDashboard === 'function' ? buildDashboard() : null,
    typeof buildKanban === 'function' ? buildKanban() : null,
    typeof buildSaas === 'function' ? buildSaas() : null,
  ]);
});
