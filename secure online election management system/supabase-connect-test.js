const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^(.*?)=(.*)$/);
  if (m) acc[m[1]] = m[2];
  return acc;
}, {});
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url);
console.log('KEY present:', !!key);
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
fetch(`${url}/rest/v1/`, {
  method: 'GET',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  },
  signal: controller.signal,
})
  .then(async (r) => {
    clearTimeout(timeout);
    console.log('STATUS', r.status);
    const text = await r.text();
    console.log('BODY', text.slice(0, 500));
  })
  .catch((e) => {
    console.error('ERROR', e.message || e);
  });
