/**
 * @module middlewares/middleware.constants
 * @layer middleware
 * @responsibility 统一 res.locals 与自定义响应头命名（跨 middleware / enricher 契约）
 * @troubleshoot 字段未注入 → 确认 MiddlewareModule 已 import 且路由命中 middleware 链
 */
/** Express res.locals 约定 key，避免魔法字符串散落 */
export const Locals = {
  mfPreloadTags: 'mfPreloadTags',
  renderAuth: 'renderAuth',
} as const;

export const Headers = {
  mfPreloadReady: 'x-mf-preload-ready',
  demoRole: 'x-demo-role',
} as const;
