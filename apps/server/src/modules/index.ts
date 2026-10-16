/**
 * @module modules/index
 * @layer ssr-http
 * @responsibility 聚合 Nest 功能模块（对齐 marki-info server/modules 入口）
 */
import { HealthModule } from '@src/modules/health/health.module.js';
import { SsrModule } from '@src/modules/ssr/ssr.module.js';

/** 注册到 AppModule.imports；新增业务模块在此追加 */
export default [HealthModule, SsrModule];
