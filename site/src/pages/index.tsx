import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const products = [
  ['01 / VIRTUAL MACHINES', 'GuestWeave', 'Create and manage guest VMs on macOS and Windows hosts. Understand each host implementation.', '/docs/products/guestweave/'],
  ['02 / ORCHESTRATION', 'HostWeave', 'Place work across hosts and connect orchestration to the runtime that executes it.', '/docs/products/hostweave/hld/'],
  ['03 / IMAGE CONSTRUCTION', 'Imageweave', 'Follow reviewed image inputs through Packer construction and qualification boundaries.', '/docs/products/imageweave/hld/'],
  ['04 / DEVICE RUNTIME', 'Agent core', 'Understand verification, supervision, host services and the guest communication channel.', '/docs/products/agent-core/hld/'],
  ['05 / CAPABILITIES', 'Agent modules', 'Explore the SDK, module lifecycle and capabilities shared across operating systems.', '/docs/products/agent-modules/hld/'],
  ['06 / SYSTEM CONTEXT', 'The platform', 'See how the pieces fit together, which interfaces connect them and where compatibility needs care.', '/docs/platform/architecture/'],
];
export default function Home() {return <Layout title="Understand the Weave platform" description="The definitive documentation for Weave: architecture, virtual machines, orchestration, images and agents."><main className="weave-home">
  <section className="weave-hero"><p className="weave-eyebrow">The Weave knowledge base</p><h1>Understand the system.<br/><span>Build what comes next.</span></h1><p className="weave-lead">One place to learn how Weave works, how its products connect, and how to build and operate projects on the platform.</p><div className="weave-actions"><Link className="button button--primary" to="/docs/start-here/">Start exploring →</Link><Link className="button button--outline button--secondary" to="/docs/platform/architecture/">View the architecture</Link></div></section>
  <section className="weave-section"><div className="weave-section-header"><h2>Five product areas.<br/>One connected platform.</h2><p>Begin with high-level designs. Follow the diagrams into responsibilities, interfaces and implementation boundaries.</p></div><div className="weave-grid">{products.map(([kicker,title,body,to]) => <Link className="weave-card" key={title} to={to}><span className="weave-card-kicker">{kicker}</span><h3>{title}</h3><p>{body}</p><span className="weave-card-arrow">Explore the design ↗</span></Link>)}</div></section>
  <section className="weave-section"><p className="weave-eyebrow">Knowledge you can trace</p><h2>Grounded in implementation.</h2><p className="weave-lead">These designs follow reviewed code at recorded commits. Compatibility limits and release status are explicit, so you can see where an integration is established and where verification is still needed.</p><div className="weave-note"><strong>The first chapter: architecture.</strong><p>This initial release covers product HLDs and interactive diagrams. Runnable tutorials, API reference and infrastructure guides follow as their workflows are validated.</p></div></section>
</main></Layout>;}
