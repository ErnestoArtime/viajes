import { mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../apps/portal/public/runtime-config.js', import.meta.url);
const config = {
  url: process.env.VIAJES_SUPABASE_URL ?? '',
  anonKey: process.env.VIAJES_SUPABASE_ANON_KEY ?? ''
};

await mkdir(new URL('../apps/portal/public/', import.meta.url), { recursive: true });
await writeFile(output, `window.__VIAJES_CONFIG__ = ${JSON.stringify(config)};\n`, 'utf8');
