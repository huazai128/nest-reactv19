/**
 * @module client/components/SsrMetaPanel
 * @layer client-ssr
 * @responsibility 只订阅 SSR / UI 展示所需 slice，与页面其它交互隔离
 */
import { useSsrMetaExpanded, useSsrPageJson } from '@src/stores/index.js';

export function SsrMetaPanel() {
  const json = useSsrPageJson();
  const expanded = useSsrMetaExpanded();

  if (!json) return null;

  return (
    <pre className="ssr-meta">
      {expanded ? json : `${json.slice(0, 120)}…`}
    </pre>
  );
}
