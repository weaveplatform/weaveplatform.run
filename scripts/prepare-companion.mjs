import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';
import {root, readYaml, sha256, filesIn} from './lib.mjs';

function arg(flag) {const i = process.argv.indexOf(flag); return i === -1 ? undefined : process.argv[i + 1];}
const target = path.resolve(arg('--out') || path.join(root,'.companion'));
assert(target !== root && !root.startsWith(target + path.sep), 'Companion cannot replace the source repository');
assert(!fs.existsSync(target) || fs.readdirSync(target).length === 0, 'Companion output must be empty');
fs.mkdirSync(target, {recursive:true});
for (const name of ['package.json','package-lock.json','.node-version','.gitignore','.markdownlint-cli2.yaml','.gitattributes','LICENSE','CODE_OF_CONDUCT.md','CONTRIBUTING.md','SECURITY.md','.github','deployment','packages','scripts','site','tools','sources','static/img']) {
  fs.cpSync(path.join(root,name),path.join(target,name),{recursive:true,filter:p => !['node_modules','build','.docusaurus','.artifacts'].includes(path.basename(p))});
}
const write = (name, text) => {const p = path.join(target,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
write('diagrams/manifest.yaml',YAML.stringify({schema_version:1,diagrams:[]}));
fs.mkdirSync(path.join(target,'diagrams/sources'),{recursive:true});
const kitFiles = filesIn(path.join(target,'packages/docs-kit')).filter(p=>!p.endsWith('UPSTREAM.json'));
write('packages/docs-kit/UPSTREAM.json',JSON.stringify({repository:'weaveplatform/weaveplatform.run',version:'0.1.0',mode:'checksummed-bootstrap',instruction:'Edit upstream. Replace this bootstrap through a reviewed docs-kit release.',files:Object.fromEntries(kitFiles.map(p=>[path.relative(path.join(target,'packages/docs-kit'),p),sha256(fs.readFileSync(p))]))},null,2)+'\n');
let lock=readYaml('sources/sources.lock.yaml');
const evidenceDirectory=arg('--evidence-dir');
if(evidenceDirectory) {
  for(const source of lock.sources.filter(s=>s.visibility==='private')) {
    for(const file of source.files.filter(f=>/\.(?:proto|yaml|json)$/.test(f.path))) {
      const bytes=fs.readFileSync(path.join(path.resolve(evidenceDirectory),source.id,file.path));
      assert.equal(sha256(bytes),file.sha256,`Evidence cache mismatch: ${source.id}:${file.path}`);
      file.snapshot=`sources/contracts/${source.id}/${file.path}`;
      write(file.snapshot,bytes);
    }
  }
}
write('sources/sources.lock.yaml',YAML.stringify(lock));
function page(name,title,description,body,evidence,slug) {
  const metadata={title,description,product:'documentation',audience:['developer','operator','contributor'],owner:'ShocOne',status:'code-inspected',verified_at:'2026-10-11',evidence,...(slug?{slug}:{})};
  const frontmatter = new YAML.Document(metadata);
  frontmatter.get('verified_at', true).type = 'QUOTE_SINGLE';
  write(`docs/${name}`,'---\n'+frontmatter.toString()+'---\n\n'+body+'\n');
}
page('start-here/index.md','Internal engineering knowledge','Private evidence and operations for the selected Weave product areas.',
`This repository owns confidential implementation evidence, environment records and operational knowledge. Public architecture explanations remain authoritative at [weaveplatform.run](https://weaveplatform.run).

Start with the [evidence register](../platform/evidence.md), [publication boundary](../platform/architecture.md), [private contracts](../reference/index.md) and [environment register](../operations/environments.md).

This initial bootstrap contains the code-inspected baseline and hosting procedures. It does not certify a production environment, incident runbook or rollback until those procedures have been exercised.`,['documentation:sources/sources.lock.yaml'],'/start-here');
page('platform/architecture.md','Knowledge ownership and publication','Public explanations and private evidence have separate authoritative homes.',
`Public product HLDs live at [weaveplatform.run](https://weaveplatform.run/docs/platform/architecture/). Link to them instead of maintaining a second copy here.

This repository retains exact private source references, confidential API snapshots, environment details, engineering decisions and recovery evidence. Public exports require owner review and a separate change in weaveplatform.run.

Both builds use the same renderer and metadata conventions. The shared docs-kit is an immutable checksummed bootstrap until its first upstream release archive exists. Treat the kit as generated upstream material.

The private repository and every hosting alias require the docs-internal team's access boundary. See the [environment register](../operations/environments.md) before enabling publication.`,['documentation:packages/docs-kit/UPSTREAM.json'],'/platform/architecture');
const evidenceRows=lock.sources.flatMap(s=>s.files.map(f=>`| ${s.id} | [${f.path}](https://github.com/${s.repository}/blob/${s.revision}/${f.path}) | \`${s.revision.slice(0,12)}\` |`)).join('\n');
page('platform/evidence.md','Implementation evidence register','Exact source paths reviewed for the first platform HLD release.',
`The initial baseline follows main commits pinned on 11 October 2026. The source lock records full commits and file checksums. This is static implementation evidence, not runtime certification.

| Product/dependency | Inspected file | Baseline commit |
| --- | --- | --- |
${evidenceRows}

Private GitHub links require product-repository access. The source-refresh workflow needs a read-only DOCS_SOURCE_TOKEN to compare those files later.`,['documentation:sources/sources.lock.yaml']);
const privateContracts=lock.sources.filter(s=>s.visibility==='private').flatMap(s=>s.files.filter(f=>f.snapshot).map(f=>`- [${s.id}: ${f.path}](/contracts/${s.id}-${path.basename(f.path)})`)).join('\n');
page('reference/index.md','Private contract reference','Reviewed snapshots of the selected private product API and protocol contracts.',
`These contracts are retained only in this private repository. They remain authoritative upstream and are validated against the source-lock checksums.

${privateContracts || 'Private contract snapshots were not supplied to this bootstrap. Import only reviewed files at their recorded source revisions.'}

Raw contracts and internal details must receive publication review before entering the public knowledge base. Contract validity is separate from router parity and request/response semantics.`,['documentation:sources/sources.lock.yaml'],'/reference');
page('operations/environments.md','Environment and access register','Record actual hosting, access and operational acceptance before publication.',
`| Item | Required state | Initial evidence |
| --- | --- | --- |
| Private GitHub repository | weaveplatform/weaveplatform.dev | Verified during repository provisioning |
| Reader team | weaveplatform/docs-internal | Grant read access; maintain membership with the Access policy |
| Canonical domain | weaveplatform.dev | Account configuration and DNS verification required |
| Production Pages alias | weaveplatform-internal.pages.dev | Access policy required before internal upload |
| Preview aliases | *.weaveplatform-internal.pages.dev | Wildcard Access policy required |
| Anonymous/non-team check | HTML, JS, search and diagrams denied | Not yet exercised |
| Authorised-reader check | All required assets available | Not yet exercised |
| CI Access token | Narrow production smoke-test policy | Not yet provisioned |
| Production rollback | Prior deployment restored and verified | Not yet exercised |

Follow deployment/README.md for setup and release steps. Keep credentials in secret storage. Update this register with policy/deployment IDs and observed results; do not convert a checklist into a verified claim.`,['documentation:deployment/README.md']);
page('development/documentation.md','Internal authoring workflow','Maintain private implementation evidence and publish approved public exports.',
`Run the same validation, build, diagram and browser commands as the public repository. New pages require metadata and exact evidence. New internal diagrams must use audience: internal in their manifest.

An internal product investigation should record the trigger, exact source commit, inspected entrypoints, claim, cross-check and remaining uncertainty. Reference the public HLD rather than duplicating it.

Source-refresh proposals report changes without rewriting prose or verification status. Record runtime acceptance separately with versions, host platform, artifact digest, commands, outcomes and cleanup.

The shared kit's UPSTREAM.json records bootstrap file hashes. Change the kit in the public repository and upgrade through a reviewed release.`,['documentation:scripts/validate.mjs']);
write('site/sidebars.ts',"export default {docs: ['start-here/index', {type:'category',label:'Engineering',items:['platform/architecture','platform/evidence']}, 'reference/index', 'operations/environments', 'development/documentation']};\n");
write('site/src/pages/index.tsx',"import React from 'react'; import Layout from '@theme/Layout'; import Link from '@docusaurus/Link'; export default function Home(){return <Layout title=\"Weave engineering\"><main className=\"weave-home\"><p className=\"weave-eyebrow\">Internal knowledge</p><h1>Weave engineering.</h1><p>Implementation evidence, environment records and operational knowledge.</p><Link className=\"button button--primary\" to=\"/docs/start-here/\">Open the knowledge base →</Link></main></Layout>;}\n");
// The private sidebar provides these stable links used by the shared footer.
page('platform/compatibility.md','Internal compatibility tracking','Follow integration gaps through exact source and runtime evidence.', 'The authoritative compatibility register is [public](https://weaveplatform.run/docs/platform/compatibility/). Retain confidential reproduction details and environment-specific acceptance here. Do not mark an integration verified without recording the selected versions and runtime results.', ['documentation:sources/sources.lock.yaml']);
const sidebar=fs.readFileSync(path.join(target,'site/sidebars.ts'),'utf8').replace("'platform/evidence'","'platform/evidence','platform/compatibility'");write('site/sidebars.ts',sidebar);
write('README.md',`# Weave internal knowledge base\n\nPrivate source for weaveplatform.dev. Public HLDs remain authoritative in weaveplatform.run.\n\nUse Node 22.23.3 and npm ci. Set DOCS_AUDIENCE=internal for validate/build/browser commands. GitHub Actions takes the audience from its repository variable.\n\nThis bootstrap contains the initial code evidence, selected private contract snapshots, shared tooling and hosting setup. Cloudflare publication is disabled until deployment/README.md prerequisites and Access tests pass.\n\nThe docs-kit is a checksummed upstream bootstrap; update it through a reviewed public release. Do not edit the vendored renderer or copy public product prose.\n`);
write('.env.example','DOCS_AUDIENCE=internal\n');
const kitSchema=path.join(target,'packages/docs-kit/schemas/page.schema.json');assert(fs.existsSync(kitSchema));
console.log(JSON.stringify({output:target,private_contracts:lock.sources.filter(s=>s.visibility==='private').flatMap(s=>s.files.filter(f=>f.snapshot)).length,publication_enabled:false}));
