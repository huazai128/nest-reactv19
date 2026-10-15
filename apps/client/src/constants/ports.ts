/**
 * @module client/constants/ports
 * @layer client-bundle
 * @responsibility 本地开发端口约定（与 docs/LOCAL-RUN.md、参考 LOCAL_RUN_GUIDE 一致）
 * @troubleshoot 浏览器访问错端口 → 应打开 NEST_HTTP_PORT，非 RSPACK_DEV_PORT
 */

/** 用户实际访问的 Nest HTTP 端口（可被环境变量 PORT 覆盖） */
export const NEST_HTTP_PORT = 3008;

/** Rspack devServer，仅 HMR / 开发静态 */
export const RSPACK_DEV_PORT = 3100;

/** 可选 Module Federation remote */
export const MF_REMOTE_DEV_PORT = 3101;

export const LOCAL_URLS = {
  nest: `http://localhost:${NEST_HTTP_PORT}`,
  rspack: `http://localhost:${RSPACK_DEV_PORT}`,
  mfRemote: `http://localhost:${MF_REMOTE_DEV_PORT}`,
} as const;
