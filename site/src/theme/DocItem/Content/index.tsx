import React, {type ReactNode} from 'react';
import Content from '@theme-original/DocItem/Content';
import type {Props} from '@theme/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

export default function SearchableDocContent(props: Props): ReactNode {
  const {frontMatter} = useDoc();
  const metadata = frontMatter as typeof frontMatter & {status?: string; verified_at?: string};
  const status = metadata.status === 'runtime-verified' ? 'Runtime verified' : 'Code inspected';
  const date = typeof metadata.verified_at === 'string' ? metadata.verified_at : '';
  return <div data-pagefind-body>
    {date && <p className="weave-provenance" data-pagefind-ignore>{status} · Last checked <time dateTime={date}>{date}</time></p>}
    <Content {...props} />
  </div>;
}
