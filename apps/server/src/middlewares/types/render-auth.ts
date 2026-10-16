/** 由中间件解析、供渲染 Guard 使用的鉴权快照 */
export interface RenderAuthLocals {
  userId: string | null;
  permissions: string[];
  roles: string[];
}

export function createAnonymousAuth(): RenderAuthLocals {
  return { userId: null, permissions: [], roles: [] };
}
