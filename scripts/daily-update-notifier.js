const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'products.json');
const STATE_PATH = path.join(ROOT, 'data', 'notifier-state.json');
const LOCK_PATH = path.join(ROOT, 'data', 'notify.lock');

const TIMEZONE = process.env.ARRIVAL_NOTIFY_TIMEZONE || 'Asia/Seoul';
const TARGET_HOUR = Number(process.env.ARRIVAL_NOTIFY_HOUR || 21);
const TARGET_MINUTE = Number(process.env.ARRIVAL_NOTIFY_MINUTE || 0);

function nowInTimeZoneParts() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const partMap = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  );

  return {
    dateKey: `${partMap.year}-${partMap.month}-${partMap.day}`,
    hour: Number(partMap.hour),
    minute: Number(partMap.minute),
  };
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function runFetchScript() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'fetch'], {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error((stderr || stdout || `fetch failed with code ${code}`).trim()));
      }
    });
  });
}

function collectProducts(payload) {
  const rows = [];
  for (const brand of payload.brands || []) {
    for (const item of brand.products || []) {
      rows.push({ brand: brand.name, name: item.name, url: item.url });
    }
  }
  return rows;
}

function toMMDD(dateKey) {
  const [, mm, dd] = dateKey.split('-');
  return `${mm}${dd}`;
}

function buildEmail(brandNames, dateKey) {
  const subject = `New Arrival_${toMMDD(dateKey)}`;
  const text = `${brandNames.join(', ')}에 새로운 상품 소식이 있어요.`;
  return { subject, text };
}

function buildNoUpdateEmail() {
  return {
    subject: '최신 상품 업데이트가 없습니다.',
    text: '오늘 최신 상품 업데이트가 없습니다.',
  };
}

async function sendSendGridEmail({ subject, text }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const to = process.env.SENDGRID_TO_EMAIL || 'fapeo16@gmail.com';

  if (!apiKey || !from || !to) {
    return { skipped: true, reason: 'SendGrid env vars missing' };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid send failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return { skipped: false, status: response.status };
}

async function acquireLock() {
  try {
    const handle = await fs.open(LOCK_PATH, 'wx');
    await handle.writeFile(String(process.pid));
    await handle.close();
    return true;
  } catch {
    try {
      const rawPid = await fs.readFile(LOCK_PATH, 'utf8');
      const pid = Number(String(rawPid).trim());
      if (pid) {
        try {
          process.kill(pid, 0);
          return false;
        } catch {}
      }
      await fs.unlink(LOCK_PATH);
      const retryHandle = await fs.open(LOCK_PATH, 'wx');
      await retryHandle.writeFile(String(process.pid));
      await retryHandle.close();
      return true;
    } catch {
      return false;
    }
  }
}

async function releaseLock() {
  try {
    await fs.unlink(LOCK_PATH);
  } catch {}
}

async function checkAndNotify({ forced = false } = {}) {
  const state = await readJson(STATE_PATH, {
    lastRunDate: '',
    knownUrls: [],
  });

  const time = nowInTimeZoneParts();
  if (!forced && state.lastRunDate === time.dateKey) {
    return { skipped: true, reason: 'already ran today', dateKey: time.dateKey };
  }

  await runFetchScript();

  const payload = await readJson(DATA_PATH, null);
  if (!payload) throw new Error('products.json not found after fetch');

  const currentItems = collectProducts(payload);
  const currentUrls = currentItems.map((x) => x.url).filter(Boolean);
  const knownSet = new Set(Array.isArray(state.knownUrls) ? state.knownUrls : []);

  const newItems = currentItems.filter((item) => item.url && !knownSet.has(item.url));
  const brandNames = [...new Set(newItems.map((item) => item.brand))];
  let emailResult = { skipped: true, reason: 'no new items' };
  if (newItems.length > 0) {
    const email = buildEmail(brandNames, time.dateKey);
    emailResult = await sendSendGridEmail(email);
  } else {
    emailResult = await sendSendGridEmail(buildNoUpdateEmail());
  }

  await writeJson(STATE_PATH, {
    lastRunDate: time.dateKey,
    knownUrls: currentUrls,
    lastCheckedAt: new Date().toISOString(),
    lastNewItemCount: newItems.length,
  });

  return {
    skipped: false,
    dateKey: time.dateKey,
    newItemCount: newItems.length,
    emailResult,
  };
}

async function maybeRunScheduledCheck() {
  const now = nowInTimeZoneParts();
  if (now.hour === TARGET_HOUR && now.minute === TARGET_MINUTE) {
    const result = await checkAndNotify();
    console.log('[notifier] run result:', result);
  }
}

async function main() {
  const once = process.argv.includes('--once');
  const locked = await acquireLock();

  if (!locked) {
    console.error('[notifier] another notify process is already running');
    process.exit(1);
  }

  try {
    if (once) {
      const result = await checkAndNotify({ forced: true });
      console.log('[notifier] once result:', result);
      return;
    }

    console.log(
      `[notifier] scheduler started (${TIMEZONE} ${String(TARGET_HOUR).padStart(2, '0')}:${String(TARGET_MINUTE).padStart(2, '0')})`,
    );
    await maybeRunScheduledCheck();

    setInterval(async () => {
      try {
        await maybeRunScheduledCheck();
      } catch (error) {
        console.error('[notifier] scheduled check failed:', error.message);
      }
    }, 60 * 1000);
  } finally {
    if (once) {
      await releaseLock();
    }
  }
}

main().catch((error) => {
  console.error('[notifier] fatal:', error.message);
  process.exit(1);
});
