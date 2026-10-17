export function pageShell(title, bodyHtml) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title} &middot; CDCS Contracts</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Azeret+Mono:wght@400;500;600&display=swap">
<style>
:root{--ink:#2B282A;--paper:#ECEBEA;--accent:#FEBD17;--muted:#6E6663;--rule:#DCD8D2;
  --bg:#DCD8D2;--fg:#2B282A;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#1A1819;--fg:#ECEBEA;--rule:#332F30;--muted:#8E8683}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:Archivo,Arial,sans-serif;
  padding:clamp(1rem,5vw,3rem) 1rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem}
.card{width:100%;max-width:34rem;background:var(--ink);color:var(--paper);border-radius:14px;
  padding:1.5rem;box-shadow:0 18px 40px -18px rgba(0,0,0,.5)}
.eyebrow{font-family:"Azeret Mono",monospace;font-size:.6rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);margin:0 0 .6rem;font-weight:700}
h1{font-size:1.3rem;margin:0 0 .8rem;letter-spacing:-.01em}
dl.fields{display:flex;flex-direction:column;margin:0 0 1rem}
.f{display:grid;grid-template-columns:8rem 1fr;gap:.7rem;padding:.5rem 0;
  border-top:1px solid rgba(255,255,255,.08)}
.f:first-child{border-top:0}
.f dt{font-family:"Azeret Mono",monospace;font-size:.6rem;letter-spacing:.1em;
  text-transform:uppercase;color:#9A908C}
.f dd{margin:0;font-size:.9rem}
.panel{width:100%;max-width:34rem;background:var(--paper);color:#2B282A;border-radius:14px;padding:1.25rem 1.5rem}
form.action{margin-top:.9rem;padding-top:.9rem;border-top:1px solid var(--rule)}
label{display:block;font-size:.8rem;font-weight:600;margin:.6rem 0 .3rem}
input,textarea,select{width:100%;font:inherit;padding:.65rem .7rem;border-radius:8px;
  border:1px solid #C4BFB8;background:#fff;color:#2B282A}
textarea{min-height:5rem;resize:vertical}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;
  padding:.75rem 1.2rem;border-radius:9px;font-weight:700;border:1px solid transparent;
  cursor:pointer;font-size:.92rem;text-decoration:none}
.btn-approve{background:#2E7D46;color:#fff}
.btn-propose{background:var(--accent);color:#231F20}
.btn-decline{background:transparent;color:#B3261E;border-color:#B3261E}
.btn-accept{background:var(--accent);color:#231F20}
.row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}
.notice{background:#FDF1D6;border:1px solid var(--accent);padding:.75rem 1rem;border-radius:8px;
  font-size:.85rem;margin-bottom:1rem}
.msg{font-size:.85rem;color:var(--muted);margin-top:.5rem}
.done{font-size:1rem}
/* Demo watermark: this whole site is a demonstration. It never blocks clicks. */
body::after{content:"";position:fixed;inset:0;z-index:2147483647;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='380' height='230' viewBox='0 0 380 230'%3E%3Ctext x='190' y='125' text-anchor='middle' transform='rotate%28-24 190 115%29' font-family='Arial, Helvetica, sans-serif' font-weight='800' font-size='30' letter-spacing='3' fill='%23FEBD17' fill-opacity='0.16'%3ETHIS IS A DEMO%3C/text%3E%3C/svg%3E");background-repeat:repeat;background-size:380px 230px}
.demo-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
</style></head><body><p class="demo-sr">This site is a demo.</p>
<p class="eyebrow">CDCS Contracts &middot; Private link</p>
${bodyHtml}
</body></html>`;
}

export function fieldsList(rows) {
  return `<dl class="fields">${rows.map(([k, v]) => v
    ? `<div class="f"><dt>${k}</dt><dd>${v}</dd></div>` : '').join('')}</dl>`;
}
