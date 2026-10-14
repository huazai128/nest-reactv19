/**
 * @module client/rspack.stage-timing.plugin
 * @layer client-bundle
 * @responsibility 输出 Rspack 编译各阶段耗时（compiler / compilation hooks）
 * @troubleshoot 关闭日志 → RSPACK_STAGE_TIMING=0；watch 每次重建都会打印
 */

const PLUGIN = 'RspackStageTimingPlugin';

/** @param {boolean | undefined} enabled */
export function isStageTimingEnabled(enabled) {
  if (enabled === false) return false;
  return process.env.RSPACK_STAGE_TIMING !== '0';
}

/**
 * @returns {import('@rspack/core').RspackPluginInstance}
 */
export function createStageTimingPlugin() {
  return {
    name: PLUGIN,
    apply(compiler) {
      const label = compiler.options?.name ?? compiler.name ?? 'bundle';
      const tag = `[rspack:${label}]`;
      /** @type {Map<string, number>} */
      const marks = new Map();
      const mark = (key) => {
        marks.set(key, performance.now());
      };

      const duration = (from, to) => {
        const a = marks.get(from);
        const b = marks.get(to);
        if (a == null || b == null) return null;
        return Math.round(b - a);
      };

      const logRow = (stage, ms, extra = '') => {
        if (ms == null) return;
        const suffix = extra ? ` ${extra}` : '';
        console.log(`${tag}  ${stage.padEnd(26)} ${String(ms).padStart(6)} ms${suffix}`);
      };

      compiler.hooks.compile.tap(PLUGIN, () => {
        marks.clear();
        mark('compile');
      });

      compiler.hooks.make.tap(PLUGIN, () => {
        mark('make');
      });

      compiler.hooks.finishMake.tap(PLUGIN, () => {
        mark('finishMake');
      });

      compiler.hooks.emit.tap(PLUGIN, () => {
        mark('emit');
      });

      compiler.hooks.afterEmit.tap(PLUGIN, () => {
        mark('afterEmit');
      });

      compiler.hooks.thisCompilation.tap(PLUGIN, (compilation) => {
        mark('thisCompilation');

        compilation.hooks.finishModules.tap(PLUGIN, () => {
          mark('finishModules');
        });

        compilation.hooks.seal.tap(PLUGIN, () => {
          mark('seal');
        });

        compilation.hooks.optimizeModules.tap(PLUGIN, () => {
          mark('optimizeModules');
        });

        compilation.hooks.afterOptimizeModules.tap(PLUGIN, () => {
          mark('afterOptimizeModules');
        });

        compilation.hooks.processAssets.tap(PLUGIN, () => {
          mark('processAssets');
        });
      });

      compiler.hooks.done.tap(PLUGIN, (stats) => {
        mark('done');

        const wall =
          stats.startTime != null && stats.endTime != null
            ? Math.round(stats.endTime - stats.startTime)
            : duration('compile', 'done');

        console.log(`\n${tag} ── 各阶段耗时 ──`);
        logRow('compile → make', duration('compile', 'make'));
        logRow('make → finishMake', duration('make', 'finishMake'));
        logRow('finishMake → finishModules', duration('finishMake', 'finishModules'));
        logRow('finishModules → seal', duration('finishModules', 'seal'));
        logRow('seal → optimizeModules', duration('seal', 'optimizeModules'));
        logRow(
          'optimizeModules → afterOpt',
          duration('optimizeModules', 'afterOptimizeModules'),
        );
        logRow('afterOptimize → processAssets', duration(
          'afterOptimizeModules',
          'processAssets',
        ));
        logRow('processAssets → emit', duration('processAssets', 'emit'));
        logRow('emit → afterEmit', duration('emit', 'afterEmit'));
        logRow('afterEmit → done', duration('afterEmit', 'done'));
        if (wall != null) {
          logRow('总计 (stats wall)', wall);
        }
        console.log('');
      });
    },
  };
}
