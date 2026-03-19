const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const app = express();
app.use(express.static('.'));

// ── Config ──
const SUPABASE_PAT     = process.env.SUPABASE_PAT || 'sbp_70f66da5a172f5d805f8de39ccd8b9b6217acef6';
const SUPABASE_PROJECT = process.env.SUPABASE_PROJECT || 'legkwcombbaepfcqsqxb';
const FAL_ADMIN_KEY    = process.env.FAL_ADMIN_KEY || 'bd31b5c8-85b1-475c-b687-4a765e7f78a4:6b7e45c6dcddebbfc2b0dba0a0c5a082';

// ── Helpers ──
function fetchJSON(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const u = new URL(url);
    const req = mod.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// ── API: SQL query to Supabase ──
app.get('/api/sql', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'missing q' });
    const result = await fetchJSON(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: fal.ai usage ──
app.get('/api/fal-usage', async (req, res) => {
  try {
    const start = req.query.start || new Date().toISOString().slice(0, 8) + '01';
    const result = await fetchJSON(
      `https://rest.alpha.fal.ai/usage/requests?start_date=${start}`,
      { headers: { 'Authorization': `Key ${FAL_ADMIN_KEY}` } }
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: USD/RUB rate ──
app.get('/api/usd-rate', async (req, res) => {
  try {
    const data = await fetchJSON('https://www.cbr-xml-daily.ru/daily_json.js');
    res.json({ rate: data.Valute?.USD?.Value || 83 });
  } catch {
    res.json({ rate: 83 });
  }
});

// ── API: Session status ──
app.get('/api/session', (req, res) => {
  try {
    const p = '/tmp/session-status.json';
    if (fs.existsSync(p)) {
      res.json(JSON.parse(fs.readFileSync(p, 'utf8')));
    } else {
      res.json(null);
    }
  } catch { res.json(null); }
});

// ── API: Cron jobs ──
app.get('/api/crons', (req, res) => {
  try {
    const p = os.homedir() + '/.openclaw/cron/jobs.json';
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const jobs = (data.jobs || []).filter(j =>
        j.payload?.kind === 'agentTurn' &&
        j.sessionTarget === 'isolated' &&
        !j.deleteAfterRun
      );
      res.json(jobs);
    } else {
      res.json([]);
    }
  } catch { res.json([]); }
});

// ── API: Memoh bots ──
app.get('/api/memoh-bots', async (req, res) => {
  try {
    const loginData = await fetchJSON('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'MysticAgent2026!' }),
    });
    if (!loginData.access_token) return res.json(null);
    const data = await fetchJSON('http://localhost:8082/api/bots', {
      headers: { 'Authorization': `Bearer ${loginData.access_token}` },
    });
    const items = data.items || data.data || (Array.isArray(data) ? data : []);
    res.json(items.map(b => ({
      name: b.display_name || b.name || 'Bot',
      status: b.is_active ? 'online' : 'offline',
      model: b.model_name || 'Gemini 2.5 Flash',
      users: b.user_count || 0,
    })));
  } catch { res.json(null); }
});

// ── API: Server stats (RAM) ──
app.get('/api/server-stats', (req, res) => {
  try {
    const meminfo = execSync('free -b 2>/dev/null').toString();
    const parts = meminfo.split('\n')[1].trim().split(/\s+/);
    res.json({
      totalRamGB: Math.round(parseInt(parts[1]) / 1073741824),
      usedRamGB: Math.round(parseInt(parts[2]) / 1073741824 * 10) / 10,
    });
  } catch {
    res.json({ totalRamGB: 96, usedRamGB: 0 });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔮 Canvas app on :${PORT}`));
