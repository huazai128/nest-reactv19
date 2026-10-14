/**
 * @module client/components/SsrMetaToolbar
 * @layer client-ssr
 * @responsibility 仅挂载 toggle action，不订阅 expanded，避免与 SsrMetaPanel 互相牵连渲染
 */
import { useSsrPageJson, useToggleSsrMetaExpanded } from '@src/stores/index.js';

/** 工具条单独组件：仅在有 JSON 时挂载，toggle 不携带 expanded 订阅 */
export function SsrMetaToolbar() {
  const json = useSsrPageJson();
  const toggle = useToggleSsrMetaExpanded();

  if (!json) return null;

  return (
    <button type="button" className="ssr-meta-toggle" onClick={toggle}>
      切换 SSR 元数据展开
    </button>
  );
}
