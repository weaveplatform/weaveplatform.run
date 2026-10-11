import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Diagram({id, title, children}: {id: string; title: string; children?: React.ReactNode}) {
  const href = useBaseUrl(`/diagrams/${id}.html`);
  return <figure className="weave-diagram">
    <div className="weave-diagram-heading"><strong>{title}</strong><a href={href} target="_blank" rel="noopener noreferrer">Open full screen ↗</a></div>
    <iframe src={href} title={title} loading="lazy" sandbox="allow-scripts allow-downloads" />
    <figcaption>{children}</figcaption>
  </figure>;
}
