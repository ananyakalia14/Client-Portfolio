import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assetMap } from '../snapshot/assets/raj/asset-map.mjs';
import { person, projects } from '../snapshot/assets/raj/content.mjs';

const snapshot = new URL('../snapshot/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', snapshot), 'utf8'));
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const titleByRoute = {
  '/': person.title, '/work': 'Work · Raj Mane', '/about': 'About · Raj Mane',
  '/b-roll': 'B-roll · Raj Mane', '/playground': 'Playground · Raj Mane',
};
const copy = new Map([
  ['sruthiiramisetty@gmail.com','rmane9313@gmail.com'],
  ['Sruthi Ramisetty', 'Raj Mane'],
  ['i love solving problems i didn’t create','i build systems that see'],
]);
const patchCopy = text => {
  for (const [from,to] of copy) text = text.replaceAll(from,to);
  return text;
};

const routes = new Map(Object.entries(manifest.routes).map(([route, deployment]) => {
  const file = route === '/' ? 'index' : route.slice(1);
  const title = titleByRoute[route] || projects[route.split('/').at(-1)]?.title + ' · Raj Mane';
  const html = readFileSync(new URL('pages/'+file+'.html', snapshot), 'utf8');
  const flight = readFileSync(new URL('pages/'+file+'.rsc', snapshot), 'utf8');
  const rendered = patchCopy(html)
    .replace(/<title>[\s\S]*?<\/title>/i,'<title>'+escape(title)+'</title>')
    .replace(/<meta\b[^>]*(?:name="description"|property="og:(?:title|description|url)"|name="twitter:(?:title|description)")[^>]*\/?>/gi,'')
    .replace(/<link\b[^>]*rel="canonical"[^>]*\/?>/gi,'')
    .replace('</head>', '<meta name="robots" content="noindex,nofollow"><meta name="description" content="'+escape(person.description)+'"><link rel="stylesheet" href="/raj/adapt.css"></head>')
    .replace('</body>','<script type="module" src="/raj/adapt.mjs"></script></body>');
  return [route, {deployment, html:Buffer.from(rendered), flight:Buffer.from(patchCopy(flight))}];
}));

export const publicDir = fileURLToPath(new URL('assets/', snapshot));
const scripts = new Map();
function adaptScript(pathname) {
  const found=scripts.get(pathname);
  if (found) return found;
  let code=patchCopy(readFileSync(new URL('assets'+pathname,snapshot),'utf8'));
  if (pathname.endsWith('/3501oje9wtl4w.js')) {
    code = code.replace('let c=["a copywriter/marketer/artist","with chutzpah."]', 'let c=["AI Data Science Engineer"," / full stack developer"]');
    code = code.replace('children:"sruthi"', 'children:"Raj Mane"');
    code = code.replace('s="Impact"', 's="Raj Geist"').replaceAll('400 100px "${s}"', '800 100px "${s}"');
    const words = { NEED:'I', MONEY:'BUILD', FOR:'SYSTEMS', MY:'THAT', PORSCHE:'SEE' };
    code = code.replace(/"\b(NEED|MONEY|FOR|MY|PORSCHE)\b"/g, (_, word) => JSON.stringify(words[word]));
    const sequence = [
      { ms:330, word:'I' },
      { ms:340, photo:'drive' },
      { ms:330, word:'BUILD' },
      { ms:340, photo:'scarf' },
      { ms:360, word:'SYSTEMS' },
      { ms:340, photo:'paris' },
      { ms:330, word:'THAT' },
      { ms:340, photo:'porsche' },
      { ms:420, word:'SEE', full:true },
    ];
    code = code.replace(/\bT=\[\{ms:420,word:"I"\}.*?\];var j=/, 'T='+JSON.stringify(sequence)+';var j=');
  }
  if (pathname.endsWith('/2g62auxs3uw95.js')) {
    code = code.replace(/JSON\.parse\('(\[\{"name":"hyderabad","lat":.*?\}\])'\)/, (_match, list) => {
      let mumbai = { name:'Mumbai', lat:19.076, lon:72.8777, area:'Mumbai', region:'Maharashtra', point:[1011.511,283.697], approximate:false };
      try {
        const found = JSON.parse(list.replaceAll("\\'", "'")).find(item => item.name === 'mumbai');
        if (found) mumbai = { ...found, name:'Mumbai', area:'Mumbai', region:'Maharashtra' };
      } catch {}
      return 'JSON.parse(' + JSON.stringify(JSON.stringify([mumbai])) + ')';
    });
  }
  if (pathname.endsWith('/3tsp6r6ji-pzp.js')) {
    code = code.replace('c="love",d="solving problems i didn’t create"', 'c="build",d="systems that see"');
    code = code.replace(
      '{text:"LOVE",edge:"edge-flat"},{text:"SOLVING",edge:"edge-sharp"},{text:"PROBLEMS",edge:"edge-flat"},{text:"I DIDN’T",edge:"edge-flat"},{text:"CREATE",edge:"edge-round",stop:!0}',
      '{text:"I",edge:"edge-flat"},{text:"BUILD",edge:"edge-sharp"},{text:"SYSTEMS",edge:"edge-flat"},{text:"THAT",edge:"edge-flat"},{text:"SEE",edge:"edge-round",stop:!0}'
    );
  }
  const bytes=Buffer.from(code);
  scripts.set(pathname,bytes);
  return bytes;
}
function serveSnapshot(req, res, next) {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (/^\/(?:[0-9a-f]{16}\/(?:script\.js|view|event)|_vercel\/insights\/)/.test(pathname)) {
    res.writeHead(204).end();
    return;
  }

  if (!['GET','HEAD'].includes(req.method)) return next();
  const source = pathname==='/about-big-life-v2.mp4' ? '/raj/project-reel.webm' : assetMap[pathname]?.[0];
  if (source) {
    res.writeHead(307,{Location:source,'Cache-Control':'no-cache'}).end();
    return;
  }
  if (/^\/_next\/static\/immutable\/chunks\/[a-z0-9_~-]+\.js$/.test(pathname)) {
    try {
      const body=adaptScript(pathname);
      res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Content-Length':body.length,'Cache-Control':'no-cache'});
      res.end(req.method==='HEAD'?undefined:body);
      return;
    } catch (error) {
      if(error.code!=='ENOENT')throw error;
    }
  }
  const page = routes.get(pathname.replace(/\/+$/, '') || '/');
  if (!page) return next();

  const isFlight = req.headers.rsc === '1';
  const body = isFlight ? page.flight : page.html;
  const headers = {
    'Content-Type': isFlight ? 'text/x-component' : 'text/html; charset=utf-8',
    'Content-Length': body.byteLength,
    'Vary': 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch',
    'Cache-Control': 'no-cache',
    'X-Robots-Tag': 'noindex, nofollow',
  };
  if (isFlight && page.deployment) {
    headers['X-Nextjs-Deployment-Id'] = page.deployment;
    headers['X-Nextjs-Stale-Time'] = '300';
  }
  res.writeHead(200, headers).end(req.method === 'HEAD' ? undefined : body);
}
export function snapshotPlugin() {
  return {
    name: 'worksruthi-raj-snapshot',
    configureServer(server) { server.middlewares.use(serveSnapshot); },
    configurePreviewServer(server) { server.middlewares.use(serveSnapshot); },
  };
}

