// Kanban tab — renders into #pane-kanban

const CRON_LABELS = {
  'evening-blog':             'Блогер пишет пост',
  'SaaS User Analytics':      'Менеджер собирает аналитику',
  'Feature Request Detector': 'Менеджер изучает запросы',
  'SaaS Skill Design Collector': 'Менеджер собирает скиллы',
  'NemoClaw release monitor': 'Разработчик мониторит систему',
};

const ROLES = {
  dispatcher:         { name:'AI Диспетчер' },
  'creative-director':{ name:'AI Креативный директор' },
  'project-manager':  { name:'AI Менеджер проектов' },
  'art-director':     { name:'AI Арт-директор' },
  'cg-supervisor':    { name:'AI CG-супервайзер' },
  screenwriter:       { name:'AI Сценарист' },
  accountant:         { name:'AI Финансист' },
  developer:          { name:'AI Технический Ревьювер' },
  grid:               { name:'AI Кодер для всего' },
  blog:               { name:'AI Контент-менеджер' },
  'studio-docs':      { name:'AI Документовед' },
  auditor:            { name:'AI Аудитор' },
  analyst:            { name:'AI Аналитик' },
};

const kanbanColumns = [
  { key:'doing',   title:'⚡ Делается',    accent:'rgba(59,130,246,0.5)',  bg:'rgba(59,130,246,0.06)',   border:'rgba(59,130,246,0.15)' },
  { key:'planned', title:'📋 Планируется', accent:'rgba(214,190,159,0.6)', bg:'rgba(214,190,159,0.04)', border:'rgba(214,190,159,0.12)' },
  { key:'done',    title:'✅ Готово',       accent:'rgba(34,197,94,0.5)',   bg:'rgba(34,197,94,0.04)',   border:'rgba(34,197,94,0.12)' },
];

const priorityDot = { high:'#ef4444', medium:'#D6BE9F', low:'rgba(255,255,255,0.2)' };

function fmtSchedule(schedule) {
  if (!schedule) return '?';
  if (schedule.kind === 'at') {
    var d = new Date(schedule.at);
    return 'Разово: ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  if (schedule.kind === 'every') {
    var h = Math.round(schedule.everyMs / 3600000);
    return h >= 1 ? 'Каждые ' + h + ' ч' : 'Каждые ' + Math.round(schedule.everyMs/60000) + ' мин';
  }
  if (schedule.kind === 'cron') {
    var expr = schedule.expr;
    if (/^0 (\d+) \* \* \*$/.test(expr)) {
      return 'Ежедневно ' + expr.match(/^0 (\d+)/)[1] + ':00';
    }
    if (/^0 \*\/(\d+) \* \* \*$/.test(expr)) {
      return 'Каждые ' + expr.match(/\/(\d+)/)[1] + ' ч';
    }
    return expr;
  }
  return schedule.kind;
}

function fmtNextRun(ms) {
  if (!ms) return '';
  var diff = ms - Date.now();
  if (diff < 0) return 'скоро';
  var h = Math.floor(diff / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return 'через ' + Math.floor(h/24) + ' дн';
  if (h >= 1) return 'через ' + h + ' ч ' + m + ' мин';
  return 'через ' + m + ' мин';
}

window.buildKanban = async function() {
  const pane = document.getElementById('pane-kanban');

  // Auto-cleanup done: keep only 15 latest
  await API.sql("DELETE FROM mystic_tasks WHERE status='done' AND id NOT IN (SELECT id FROM mystic_tasks WHERE status='done' ORDER BY updated_at DESC LIMIT 15)");

  const [rawTasks, cronJobs] = await Promise.all([
    API.sql("SELECT id, title, description, role, status, priority FROM mystic_tasks ORDER BY CASE status WHEN 'doing' THEN 0 WHEN 'planned' THEN 1 WHEN 'done' THEN 2 END, updated_at DESC"),
    API.crons(),
  ]);

  const TASKS = rawTasks.map(t => ({ ...t, desc: t.description || '' }));

  const usedRoles = [...new Set(TASKS.map(t => t.role))];
  const agentStats = usedRoles
    .map(r => {
      const role = ROLES[r] || { name: r };
      const all = TASKS.filter(t => t.role === r);
      return { role, total: all.length, doing: all.filter(t=>t.status==='doing').length, planned: all.filter(t=>t.status==='planned').length, done: all.filter(t=>t.status==='done').length };
    })
    .sort((a, b) => b.total - a.total);

  const totalTasks = agentStats.reduce((s, a) => s + a.total, 0);
  const legendHTML = agentStats.map(({ role, total }) => {
    const pct = totalTasks ? Math.round(total / totalTasks * 100) : 0;
    return `<div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px">
      <span style="font-size:28px;font-family:'Grafita',sans-serif;font-weight:300;color:#D6BE9F;line-height:1">${total}</span>
      <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.3;word-break:break-word">${role.name}</div>
      <div style="height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden;margin-top:2px"><div style="width:${pct}%;height:100%;background:rgba(214,190,159,0.4);border-radius:1px"></div></div>
    </div>`;
  }).join('');

  const sectionsHTML = kanbanColumns.map(col => {
    const colTasks = TASKS.filter(t => t.status === col.key);
    const cards = colTasks.map(t => {
      const role = ROLES[t.role] || { name: t.role || '?' };
      const dot = priorityDot[t.priority] || priorityDot.low;
      return `<div class="g" style="padding:12px 14px;display:flex;gap:10px;align-items:flex-start">
        <div style="width:5px;height:5px;border-radius:50%;background:${dot};flex-shrink:0;margin-top:6px"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;color:rgba(214,190,159,0.55);letter-spacing:0.04em;margin-bottom:4px;font-family:'Grafita',sans-serif">${role.name}</div>
          <div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.3;margin-bottom:2px">${t.title}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.3);line-height:1.35">${t.desc}</div>
        </div>
      </div>`;
    }).join('');
    return `<div class="col" style="min-width:260px;max-width:300px;flex-shrink:0;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:14px;background:${col.bg};border:1px solid ${col.border}">
        <div style="width:3px;height:14px;border-radius:2px;background:${col.accent}"></div>
        <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);flex:1">${col.title}</span>
        <span style="font-size:11px;padding:2px 8px;border-radius:100px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4)">${colTasks.length}</span>
      </div>
      ${cards}
    </div>`;
  }).join('');

  // Cron section
  let cronSection = '';
  if (cronJobs.length > 0) {
    const cards = cronJobs.map(j => {
      const hasError = (j.state?.consecutiveErrors || 0) > 0;
      const status = hasError ? 'error' : (j.state?.lastRunStatus || 'new');
      const dotColor = hasError ? '#ef4444' : status === 'ok' ? 'rgba(34,197,94,0.8)' : status === 'new' ? 'rgba(214,190,159,0.5)' : '#ef4444';
      const schedule = fmtSchedule(j.schedule);
      const nextRun = fmtNextRun(j.state?.nextRunAtMs);
      return `<div class="g" style="padding:12px 14px;display:flex;gap:10px;align-items:flex-start;min-width:220px;max-width:260px;flex-shrink:0">
        <div style="width:5px;height:5px;border-radius:50%;background:${dotColor};flex-shrink:0;margin-top:5px"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.3;margin-bottom:3px">${CRON_LABELS[j.name] || j.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:4px">${schedule}${nextRun ? ' · ' + nextRun : ''}</div>
          ${hasError ? `<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:rgba(239,68,68,0.8)">${j.state.consecutiveErrors} ошибки подряд</span>` : ''}
        </div>
      </div>`;
    }).join('');
    cronSection = `<div style="margin-bottom:20px">
      <div style="font-size:11px;letter-spacing:0.1em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:10px">Расписание агентов</div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none">${cards}</div>
    </div>`;
  }

  pane.innerHTML = `
  <div style="position:relative;z-index:1">
    <div style="margin-bottom:28px">
      <div class="dp" style="font-size:40px;letter-spacing:0.03em;color:rgba(255,255,255,0.95);line-height:1">ЗАДАЧИ</div>
    </div>
    <div class="g" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0;margin-bottom:16px;padding:0;overflow:hidden">${legendHTML}</div>
    ${cronSection}
    <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory">${sectionsHTML}</div>
  </div>`;
};
