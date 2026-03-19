// SaaS tab — renders into #pane-saas

window.buildSaas = async function() {
  const pane = document.getElementById('pane-saas');

  const HARDCODE_BOTS = [
    { name: 'Katya Assistant', model: 'Gemini 2.5 Flash', status: 'online', users: 2 },
    { name: 'MysticV2 Test Bot', model: 'Gemini 2.5 Flash', status: 'online', users: 1 },
    { name: "Max's Assistant", model: 'Gemini 2.5 Flash', status: 'online', users: 1 },
  ];

  const HARDCODE_BACKLOG = [
    { title: 'Напоминания (нужна таблица reminders)', priority: '🔴', status: 'planned' },
    { title: 'Юридика / авторское право РФ', priority: '🟡', status: 'planned' },
    { title: 'Автогенератор договоров', priority: '🟡', status: 'planned' },
    { title: 'Vision для скриншотов', priority: '🟠', status: 'planned' },
    { title: 'KPI-трекер', priority: '⚪', status: 'planned' },
  ];

  const [liveBots, saasTasksRaw, serverStats] = await Promise.all([
    API.memohBots(),
    API.sql("SELECT title, status, priority FROM mystic_tasks WHERE role IN ('analyst', 'project-manager') ORDER BY status, priority"),
    API.serverStats(),
  ]);

  const bots = liveBots || HARDCODE_BOTS;
  const hasTasks = saasTasksRaw.length > 0;
  const priorityIcon = { high: '🔴', medium: '🟡', low: '⚪' };
  const tasksList = hasTasks
    ? saasTasksRaw.map(t => ({ title: t.title, priority: priorityIcon[t.priority] || '🟠', status: t.status }))
    : HARDCODE_BACKLOG;

  // Сервер Mini Forum X-Pro: 96 GB RAM (хардкод — Railway не знает реальную RAM)
  const totalRamGB = 96;
  const usedRamGB = 2.5;
  const botsCount = bots.length;
  const ramPerBot = 0.3;
  const ramReserved = 8;
  const ramAvailable = totalRamGB - ramReserved;
  const maxBots = Math.floor(ramAvailable / ramPerBot);
  const ramPct = Math.round(usedRamGB / totalRamGB * 100);

  const now = new Date().toLocaleString('ru-RU', { timeZone:'Europe/Moscow', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });

  const botCards = bots.map(b => {
    const isOnline = (b.status === 'online' || b.status === 'active');
    const dotColor = isOnline ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.2)';
    const statusText = isOnline ? 'online' : 'offline';
    const statusColor = isOnline ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.25)';
    const name = b.name || 'Bot';
    const model = b.model || '';
    const users = b.users || 0;
    return `<div class="g" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:14px">
      <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;box-shadow:${isOnline ? '0 0 8px rgba(34,197,94,0.4)' : 'none'}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;color:rgba(255,255,255,0.92);font-weight:500">${name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px">${model}${users ? ' · ' + users + ' юзеров' : ''}</div>
      </div>
      <span style="font-size:11px;padding:3px 10px;border-radius:100px;background:${isOnline ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isOnline ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'};color:${statusColor};text-transform:uppercase;letter-spacing:0.05em">${statusText}</span>
    </div>`;
  }).join('');

  const taskItems = tasksList.map((t, i, arr) => {
    const statusLabel = t.status === 'doing' ? '<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);color:rgba(59,130,246,0.8);margin-left:8px">в работе</span>' : t.status === 'done' ? '<span style="font-size:10px;padding:2px 7px;border-radius:100px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:rgba(34,197,94,0.8);margin-left:8px">готово</span>' : '';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0${i < arr.length - 1 ? ';border-bottom:1px solid rgba(255,255,255,0.04)' : ''}">
      <span style="font-size:14px;flex-shrink:0">${t.priority}</span>
      <span style="font-size:14px;color:rgba(255,255,255,0.9);flex:1">${t.title}</span>
      ${statusLabel}
    </div>`;
  }).join('');

  pane.innerHTML = `
  <div style="position:relative;z-index:1">
    <div style="margin-bottom:28px;display:flex;align-items:baseline;justify-content:space-between">
      <div class="dp" style="font-size:40px;letter-spacing:0.03em;color:rgba(255,255,255,0.95);line-height:1">SaaS</div>
      <span style="font-size:12px;color:rgba(255,255,255,0.3)">${now}</span>
    </div>

    <!-- Bots -->
    <div style="margin-bottom:20px">
      <div style="font-size:11px;letter-spacing:0.1em;color:rgba(34,197,94,0.5);text-transform:uppercase;margin-bottom:10px">Боты${liveBots ? '' : ' <span style="color:rgba(255,255,255,0.2)">(hardcode — API недоступен)</span>'}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${botCards}</div>
    </div>

    <!-- Server Capacity -->
    <div class="g" style="padding:16px;margin-bottom:20px;animation:pulse-green 4s ease-in-out infinite">
      <div style="font-size:11px;letter-spacing:0.1em;color:rgba(34,197,94,0.5);text-transform:uppercase;margin-bottom:12px">Ёмкость сервера · Mini Forum X-Pro</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
        <div style="text-align:center">
          <div class="dp" style="font-size:28px;color:rgba(34,197,94,0.9);line-height:1">${totalRamGB}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">GB RAM</div>
        </div>
        <div style="text-align:center">
          <div class="dp" style="font-size:28px;color:rgba(255,255,255,0.92);line-height:1">${botsCount}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">ботов активно</div>
        </div>
        <div style="text-align:center">
          <div class="dp" style="font-size:28px;color:rgba(214,190,159,0.9);line-height:1">~${maxBots}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">макс. ботов</div>
        </div>
      </div>
      <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;margin-bottom:6px">
        <div style="width:${ramPct}%;height:100%;background:rgba(34,197,94,0.5);border-radius:2px"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.25)">
        <span>RAM: ${usedRamGB} / ${totalRamGB} GB (${ramPct}%)</span>
        <span>~${ramPerBot} GB / бот</span>
      </div>
    </div>

    <!-- Backlog -->
    <div class="g" style="padding:16px;margin-bottom:20px">
      <div style="font-size:11px;letter-spacing:0.1em;color:rgba(34,197,94,0.5);text-transform:uppercase;margin-bottom:12px">Задачи к внедрению${hasTasks ? '' : ' <span style="color:rgba(255,255,255,0.2)">(приоритеты из аналитики)</span>'}</div>
      ${taskItems}
    </div>

    <div style="text-align:center;font-size:11px;color:rgba(255,255,255,0.15);margin-top:24px">
      ${hasTasks ? 'Supabase · mystic_tasks' : 'Hardcode priorities'} · ${liveBots ? 'Memoh API live' : 'Memoh API offline'}
    </div>
  </div>`;
};
