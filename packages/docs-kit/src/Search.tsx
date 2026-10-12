import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

declare global {interface Window {PagefindUI?: new (options: object) => {destroy: () => void}}}

export default function Search() {
  const mount = useRef<HTMLDivElement>(null);
  const base = useBaseUrl('/pagefind/');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let ui: {destroy: () => void} | undefined;
    const script = document.createElement('script');
    script.src = `${base}pagefind-ui.js`;
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = `${base}pagefind-ui.css`;
    script.onload = () => {if (active && mount.current && window.PagefindUI) ui = new window.PagefindUI({element: mount.current, showSubResults: true, showImages: false});};
    script.onerror = () => {if (active) setError(true);};
    document.head.append(css, script);
    return () => {active = false; ui?.destroy(); script.remove(); css.remove();};
  }, [base]);
  return <><div ref={mount} className="weave-search" />{error && <p role="status">Search is available in the production build. Run <code>npm run build</code> and <code>npm run serve</code> for a local search preview.</p>}</>;
}
