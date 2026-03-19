// Dashboard tab — renders into #pane-dashboard
const CRM_URL = 'https://web-production-461bf.up.railway.app';

function statusBadge(status) {
  const map = {
    active:    ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.8)', 'В работе'],
    draft:     ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.35)', 'Черновик'],
    completed: ['rgba(214,190,159,0.08)', 'rgba(214,190,159,0.2)', '#D6BE9F', 'Готово'],
    archived:  ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.2)', 'Архив'],
  };
  const [bg, border, color, label] = map[status] || ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.35)', status];
  return `<span style="font-size:12px;font-weight:500;padding:2px 9px;border-radius:100px;background:${bg};color:${color};border:1px solid ${border};white-space:nowrap">${label}</span>`;
}

function sessionStatusBlock(s) {
  if (!s) return '';
  const rawPct = s.pct || 0;
  const comp = s.compactions || 0;
  const pct = Math.min(100, rawPct + comp * 12);
  const free = 100 - pct;
  const level = pct >= 85 ? 'red' : pct >= 70 ? 'orange' : pct >= 50 ? 'yellow' : 'green';
  const barColor = level === 'red' ? '#F87171' : level === 'orange' ? 'rgba(251,146,60,0.9)' : level === 'yellow' ? '#D6BE9F' : 'rgba(255,255,255,0.25)';
  const textColor = level === 'red' ? '#F87171' : level === 'orange' ? 'rgba(251,146,60,0.9)' : 'rgba(255,255,255,0.55)';
  const statusText = level === 'red' ? 'Нужна новая сессия' : level === 'orange' ? 'Голова перегружается' : level === 'yellow' ? 'Много держу в уме' : 'Голова свежая';
  const ageMin = s.updatedAt ? Math.round((Date.now() - new Date(s.updatedAt).getTime()) / 60000) : null;
  const stale = ageMin !== null && ageMin > 60;
  const ageText = ageMin === null ? '' : ageMin < 2 ? 'только что' : ageMin < 60 ? `${ageMin} мин назад` : `${Math.round(ageMin/60)} ч назад`;

  return `
  <div style="background:rgba(255,255,255,0.03);border:1px solid ${stale ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.07)'};border-radius:16px;padding:14px 16px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:13px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.05em;font-family:'Grafita',system-ui,sans-serif">Голова Мистика</span>
      <span style="font-size:14px;color:${stale ? 'rgba(251,146,60,0.7)' : textColor};font-family:'Grafita',system-ui,sans-serif">${free}% живости${comp ? ` (${100-rawPct}% контекст − ${comp}×12% износ)` : ''} · ${ageText}</span>
    </div>
    <div style="background:rgba(255,255,255,0.06);border-radius:3px;height:3px;overflow:hidden;margin-bottom:10px">
      <div style="width:${pct}%;height:100%;background:${barColor};border-radius:3px"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:14px;color:${textColor};font-family:'Grafita',system-ui,sans-serif">${statusText}</span>
      ${comp != null ? `<span style="font-size:13px;font-family:'Grafita',sans-serif;color:${comp >= 5 ? '#F87171' : comp >= 3 ? 'rgba(251,146,60,0.9)' : comp >= 1 ? '#D6BE9F' : 'rgba(255,255,255,0.35)'}">${comp} ${comp===1?'компакция':comp>=2&&comp<=4?'компакции':'компакций'}</span>` : ''}
    </div>
  </div>
  <details class="edu" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:16px;margin-bottom:10px;overflow:hidden">
    <summary style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent">
      <span style="font-size:14px;color:rgba(255,255,255,0.55)">Как Мистик устаёт и восстанавливается</span>
      <span class="edu-arrow" style="font-size:12px;color:rgba(255,255,255,0.3)">▾</span>
    </summary>
    <div style="padding:0 16px 16px;border-top:1px solid rgba(255,255,255,0.04)">
      <div style="display:flex;flex-direction:column;gap:12px;padding-top:12px">
        <div>
          <div style="font-size:14px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:4px">Почему Мистик устаёт</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.65">Когда слишком много информации держу в голове, начинаю хуже работать с памятью. Это называется контекст сессии — объём всего, что я сейчас помню.</div>
        </div>
        <div style="height:1px;background:rgba(255,255,255,0.04)"></div>
        <div>
          <div style="font-size:14px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:4px">Отдохнуть = новая сессия</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.65">Когда отправляешь <span style="color:#D6BE9F;font-family:monospace">/new</span> — я выгружаю всё важное в память, очищаю голову и просыпаюсь свежим.</div>
        </div>
        <div style="height:1px;background:rgba(255,255,255,0.04)"></div>
        <div>
          <div style="font-size:14px;font-weight:500;color:rgba(255,255,255,0.75);margin-bottom:4px">Что я делаю сам</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.65">Каждую ночь в 4:00 автоматически обновляю сессии — сохраняю важное и выхожу отдохнуть.</div>
        </div>
      </div>
    </div>
  </details>`;
}

window.buildDashboard = async function() {
  const pane = document.getElementById('pane-dashboard');

  const [projects, tasks, applications, freelancers, falData, sess, contactsData] = await Promise.all([
    API.sql("SELECT id, title, status, budget, deadline, actual_cost, category FROM projects WHERE status NOT IN ('archived') ORDER BY category, created_at DESC"),
    API.sql("SELECT id, title, status, project_id, is_published, assigned_to, budget, deadline, skills_required FROM tasks ORDER BY created_at DESC"),
    API.sql("SELECT id, task_id, status, created_at FROM applications"),
    API.sql("SELECT id, is_available, skills, rating FROM freelancers"),
    API.falUsage('2026-03-01'),
    API.session(),
    API.sql("SELECT COUNT(*) as total FROM contacts"),
  ]);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  let falTotalCost = 0, falTodayCost = 0;
  const falCategories = { photo: { cost: 0 }, video: { cost: 0 }, audio: { cost: 0 } };
  const falByModel = {};
  const falByModelCategory = { photo: {}, video: {}, audio: {} };
  const videoKw = ['kling-video','hallo','hallo2','sadtalker','wav2lip','musetalk','latentsync','live-portrait'];
  const audioKw = ['f5-tts','kokoro','minimax/speech','minimax/voice','qwen-3-tts'];
  const modelNames = {
    'nano-banana-pro':'Генерация фото','nano-banana-2':'Генерация фото 2','flux':'Flux фото',
    'flux-lora':'Flux с обучением','flux-lora-fast-training':'Обучение модели',
    'flux-lora-portrait-trainer':'Обучение портрет','flux-pro':'Flux Pro','flux-2-pro':'Flux Pro 2',
    'instantid':'Замена лица','pulid':'Замена лица 2','ip-adapter-face-id':'Face ID перенос',
    'kling-video':'Видео Kling','hallo':'Говорящее видео','hallo2':'Говорящее видео 2',
    'sadtalker':'Анимация лица','wav2lip':'Синхронизация губ','musetalk':'MuseTalk',
    'latentsync':'LatentSync','live-portrait':'Живой портрет','f5-tts':'Клон голоса F5',
    'kokoro':'Синтез речи','minimax':'MiniMax голос','qwen-3-tts':'Синтез речи Qwen',
    'bytedance':'Генерация фото','xai':'Grok генерация',
  };

  for (const b of (falData.time_series || [])) {
    const isToday = b.bucket.startsWith(todayStr);
    for (const r of (b.results || [])) {
      const cost = Math.abs(r.cost);
      falTotalCost += cost;
      if (isToday) falTodayCost += cost;
      const name = r.endpoint_id.replace('fal-ai/', '').split('/')[0];
      falByModel[name] = (falByModel[name] || 0) + cost;
      const eCat = r.endpoint_id.toLowerCase();
      let cat;
      if (videoKw.some(v => eCat.includes(v))) { cat = 'video'; falCategories.video.cost += cost; }
      else if (audioKw.some(a => eCat.includes(a))) { cat = 'audio'; falCategories.audio.cost += cost; }
      else { cat = 'photo'; falCategories.photo.cost += cost; }
      falByModelCategory[cat][name] = (falByModelCategory[cat][name] || 0) + cost;
    }
  }

  // toggleGenCat global
  window.toggleGenCat = function(cat) {
    var el = document.getElementById('gen-cat-' + cat);
    if (!el) return;
    var open = el.style.display !== 'none';
    ['photo','video','audio'].forEach(function(c) {
      var d = document.getElementById('gen-cat-' + c);
      var lbl = document.getElementById('gen-lbl-' + c);
      if (d) d.style.display = 'none';
      if (lbl) { lbl.style.color = 'rgba(255,255,255,0.3)'; lbl.style.fontWeight = 'normal'; }
    });
    if (!open) {
      el.style.display = 'block';
      var lbl = document.getElementById('gen-lbl-' + cat);
      if (lbl) { lbl.style.color = '#D6BE9F'; lbl.style.fontWeight = '600'; }
    }
  };

  // Project stats
  const contactsTotal = (contactsData[0] && contactsData[0].total) || 0;
  const projByStatus = { active:0, draft:0, completed:0 };
  projects.forEach(p => { if (projByStatus[p.status] !== undefined) projByStatus[p.status]++; });
  const projByCategory = {};
  projects.forEach(p => {
    const cat = p.category || 'other';
    if (!projByCategory[cat]) projByCategory[cat] = [];
    projByCategory[cat].push(p);
  });
  const catLabels = { production:'Продакшн', presale:'Пресейл', internal:'Внутренние', other:'Прочие' };

  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const oldApps = applications.filter(a =>
    a.status === 'pending' && (Date.now() - new Date(a.created_at).getTime()) > 48*3600*1000
  ).length;
  const burning = tasks.filter(t =>
    t.deadline && !['done','review'].includes(t.status) && daysLeft(t.deadline) <= 2
  ).slice(0, 5);

  const nowStr = now.toLocaleDateString('ru', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' }).replace(',','');

  pane.innerHTML = `
  <div style="position:relative;z-index:1">
  <!-- Header -->
  <div style="margin-bottom:28px;display:flex;align-items:center;gap:14px;flex-wrap:nowrap">
    <div class="dp" style="font-size:40px;letter-spacing:0.03em;color:rgba(255,255,255,0.95);line-height:1;flex:1;min-width:0">AI <span id="mt"></span></div>
    <a href="https://mystic-graph-production.up.railway.app" target="_blank" style="padding:6px 18px;border-radius:100px;border:1px solid rgba(214,190,159,0.3);background:rgba(214,190,159,0.07);color:#D6BE9F;font-size:14px;font-family:'Grafita',sans-serif;text-decoration:none;display:inline-flex;align-items:center;white-space:nowrap;letter-spacing:0.03em;flex-shrink:0;-webkit-tap-highlight-color:transparent">🕸️ Граф знаний</a>
    <a href="${CRM_URL}" target="_blank" style="padding:6px 18px;border-radius:100px;border:1px solid rgba(214,190,159,0.3);background:rgba(214,190,159,0.07);color:#D6BE9F;font-size:22px;line-height:1;font-family:'Grafita',sans-serif;text-decoration:none;display:flex;align-items:center;white-space:nowrap;letter-spacing:0.03em;position:relative;overflow:hidden;flex-shrink:0;animation:crm-pulse 2.8s ease-in-out infinite;-webkit-tap-highlight-color:transparent">AI CRM<span style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;background:linear-gradient(105deg,transparent 25%,rgba(214,190,159,0.35) 50%,transparent 75%);animation:crm-shine 3.2s ease-in-out infinite"></span></a>
  </div>

  <!-- Session status -->
  ${sessionStatusBlock(sess)}

  <!-- Alerts -->
  ${pendingApps > 0 ? `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.15);margin-bottom:10px"><div style="width:5px;height:5px;border-radius:50%;background:#F87171;flex-shrink:0"></div><div style="font-size:14px;color:rgba(248,113,113,0.85)">${pendingApps} заявок ожидают рассмотрения</div></div>` : ''}
  ${oldApps > 0 ? `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.15);margin-bottom:10px"><div style="width:5px;height:5px;border-radius:50%;background:#F87171;flex-shrink:0"></div><div style="font-size:14px;color:rgba(248,113,113,0.85)">${oldApps} заявок без ответа больше 48 ч</div></div>` : ''}
  ${burning.length > 0 ? `<div class="g" style="margin-bottom:10px;border-color:rgba(248,113,113,0.12);padding:16px"><div class="cap" style="color:rgba(248,113,113,0.6);margin-bottom:10px">Горящие задачи</div>${burning.map((t,i,arr)=>{const dl=daysLeft(t.deadline);const dlText=dl<0?'просрочено '+Math.abs(dl)+' дн':dl===0?'сегодня':dl+' дн';const dlColor=dl<=0?'#F87171':'rgba(255,255,255,0.35)';return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0'+(i<arr.length-1?';border-bottom:1px solid rgba(255,255,255,0.05)':'')+'">'+'<div style="font-size:15px;color:rgba(255,255,255,0.8);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px">'+t.title+'</div>'+'<span style="font-size:13px;color:'+dlColor+';white-space:nowrap">'+dlText+'</span></div>';}).join('')}</div>` : ''}

  <!-- Расходы AI -->
  <div class="g" style="margin-bottom:10px;padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px">
      <div class="cap">Расходы AI</div>
      <span style="font-size:18px;font-family:'Grafita',sans-serif;font-weight:400;color:#D6BE9F">~${rubFmt(568)} ₽/мес</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
      ${[
        { name:'Cursor', cost:240, desc:'AI-кодинг', pct:42 },
        { name:'Anthropic', cost:200, desc:'Claude Opus + Sonnet', pct:35 },
        { name:'fal.ai', cost:falTotalCost, desc:'Генерации (фото/видео/аудио)', pct:21, dyn:true },
        { name:'OpenRouter', cost:8, desc:'Субагенты, fallback', pct:1 },
      ].map(s=>`<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px"><span style="font-size:14px;color:rgba(255,255,255,0.75);font-weight:500">${s.name}</span><span style="font-size:14px;color:#D6BE9F;font-weight:400">${rubFmt(s.dyn?s.cost:s.cost)} ₽</span></div><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden"><div style="width:${s.pct}%;height:100%;background:rgba(214,190,159,0.4);border-radius:2px"></div></div><span style="font-size:11px;color:rgba(255,255,255,0.25);white-space:nowrap">${s.desc}</span></div></div></div>`).join('')}
    </div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:4px 0 14px"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.05em;text-transform:uppercase">Генерации fal.ai</div>
      <span style="font-size:12px;color:rgba(255,255,255,0.4)">${rubFmt(falTotalCost)} ₽ / март</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-bottom:14px">
      <div onclick="toggleGenCat('photo')" style="text-align:center;padding:6px 0;cursor:pointer">
        <div style="font-size:18px;font-family:'Grafita',sans-serif;font-weight:400;color:#D6BE9F;line-height:1;letter-spacing:-0.01em">${rubFmt(falCategories.photo.cost)} ₽</div>
        <div id="gen-lbl-photo" style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px;letter-spacing:0.04em;text-transform:uppercase;transition:color 0.2s">Фото ▾</div>
      </div>
      <div onclick="toggleGenCat('video')" style="text-align:center;padding:6px 0;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);cursor:pointer">
        <div style="font-size:18px;font-family:'Grafita',sans-serif;font-weight:400;color:#D6BE9F;line-height:1;letter-spacing:-0.01em">${rubFmt(falCategories.video.cost)} ₽</div>
        <div id="gen-lbl-video" style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px;letter-spacing:0.04em;text-transform:uppercase;transition:color 0.2s">Видео ▾</div>
      </div>
      <div onclick="toggleGenCat('audio')" style="text-align:center;padding:6px 0;border-right:1px solid rgba(255,255,255,0.05);cursor:pointer">
        <div style="font-size:18px;font-family:'Grafita',sans-serif;font-weight:400;color:#D6BE9F;line-height:1;letter-spacing:-0.01em">${rubFmt(falCategories.audio.cost)} ₽</div>
        <div id="gen-lbl-audio" style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px;letter-spacing:0.04em;text-transform:uppercase;transition:color 0.2s">Аудио ▾</div>
      </div>
      <div style="text-align:center;padding:6px 0">
        <div style="font-size:18px;font-family:'Grafita',sans-serif;font-weight:400;color:rgba(255,255,255,0.3);line-height:1;letter-spacing:-0.01em">${falTodayCost > 0.005 ? rubFmt(falTodayCost)+' ₽' : '—'}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px;letter-spacing:0.04em;text-transform:uppercase">Сегодня</div>
      </div>
    </div>
    ${['photo','video','audio'].map(cat=>{
      const models = Object.entries(falByModelCategory[cat]).sort((a,b)=>b[1]-a[1]);
      if (!models.length) return `<div id="gen-cat-${cat}" style="display:none"></div>`;
      const label = cat==='photo'?'Фото':cat==='video'?'Видео':'Аудио';
      return `<div id="gen-cat-${cat}" style="display:none"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin-bottom:10px"></div><div style="font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px">${label}</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px">${models.map(([n,c])=>`<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:rgba(255,255,255,0.45)">${modelNames[n]||n}</span><span style="font-size:13px;font-weight:500;color:#D6BE9F">${rub(c)} ₽</span></div>`).join('')}</div></div>`;
    }).join('')}
  </div>

  <!-- Проекты -->
  <div class="g" style="margin-bottom:10px;padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px">
      <div class="cap">Проекты</div>
      <div style="display:flex;gap:8px;align-items:baseline">
        ${projByStatus.active ? `<span style="font-size:13px;color:rgba(255,255,255,0.7)">${projByStatus.active} в работе</span>` : ''}
        ${projByStatus.draft ? `<span style="font-size:13px;color:rgba(255,255,255,0.35)">${projByStatus.draft} черновиков</span>` : ''}
      </div>
    </div>
    ${Object.entries(projByCategory).map(([cat, projs]) => `
      <div style="margin-bottom:12px">
        <div style="font-size:11px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">${catLabels[cat] || cat}</div>
        ${projs.map((p, i, arr) => {
          const budgetText = p.budget ? (Number(p.budget) >= 1000000 ? Math.round(Number(p.budget)/1000000) + ' млн ₽' : Number(p.budget).toLocaleString('ru-RU') + ' ₽') : '';
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0${i < arr.length - 1 ? ';border-bottom:1px solid rgba(255,255,255,0.04)' : ''}">
            <div style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;overflow:hidden">
              <span style="font-size:14px;color:rgba(255,255,255,0.8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</span>
              ${statusBadge(p.status)}
            </div>
            ${budgetText ? `<span style="font-size:13px;color:#D6BE9F;white-space:nowrap;margin-left:8px">${budgetText}</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    `).join('')}
  </div>

  <!-- Контакты -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
    <div class="g" style="padding:14px 16px;text-align:center">
      <div style="font-size:28px;font-family:'Grafita',sans-serif;font-weight:300;color:#D6BE9F;line-height:1">${contactsTotal}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;text-transform:uppercase;letter-spacing:0.05em">Контактов</div>
    </div>
    <div class="g" style="padding:14px 16px;text-align:center">
      <div style="font-size:28px;font-family:'Grafita',sans-serif;font-weight:300;color:#D6BE9F;line-height:1">${projects.length}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;text-transform:uppercase;letter-spacing:0.05em">Проектов</div>
    </div>
  </div>

  </div>`;

  // Init МИСТИК↔MYSTIC header animation
  initHeaderAnimation();
};

function initHeaderAnimation() {
  var L=[{r:'М',e:'M'},{r:'И',e:'Y'},{r:'С',e:'S'},{r:'T',e:'T'},{r:'И',e:'I'},{r:'К',e:'C'}];
  var G=['#','@','/','*','&'];
  var CR='rgba(255,255,255,0.95)',CE='rgba(214,190,159,0.92)',CG='rgba(214,190,159,0.3)';
  var c=document.getElementById('mt');
  if(!c) return;
  c.style.cssText='display:inline-flex;align-items:baseline;gap:1px;letter-spacing:0;vertical-align:baseline';
  var spans=L.map(function(l){
    var s=document.createElement('span');
    s.textContent=l.r; s.dataset.st='r';
    var ff="'Grafita Special','Grafita',sans-serif";
    s.style.cssText="display:inline-flex;align-items:center;justify-content:center;letter-spacing:0;font-family:"+ff+";transition:opacity 0.2s ease,color 0.3s ease;color:"+CR;
    c.appendChild(s); return s;
  });
  function ft(s,l,toEn,delay){
    setTimeout(function(){
      var tgt=toEn?l.e:l.r, tc=toEn?CE:CR;
      s.style.opacity='0.05'; s.style.color=CG;
      setTimeout(function(){
        s.textContent=G[Math.floor(Math.random()*G.length)];
        setTimeout(function(){s.textContent=tgt;s.style.color=tc;s.style.opacity='1';s.dataset.st=toEn?'e':'r';},80);
      },180);
    },delay);
  }
  function wave(toEn,done){
    var ord=[0,1,2,3,4,5].sort(function(){return Math.random()-0.5;});
    var mx=0;
    ord.forEach(function(i,step){var d=step*(300+Math.floor(Math.random()*350));if(d>mx)mx=d;ft(spans[i],L[i],toEn,d);});
    setTimeout(done,mx+380);
  }
  function cycle(){
    setTimeout(function(){
      wave(true,function(){
        setTimeout(function(){
          wave(false,function(){ cycle(); });
        },2500);
      });
    },3000);
  }
  document.fonts.ready.then(function(){
    spans.forEach(function(s,i){
      var wRu=s.getBoundingClientRect().width;
      s.textContent=L[i].e;
      var wEn=s.getBoundingClientRect().width;
      s.textContent=L[i].r;
      s.style.width=Math.ceil(Math.max(wRu,wEn))+'px';
    });
    setTimeout(cycle,800);
  });
}
