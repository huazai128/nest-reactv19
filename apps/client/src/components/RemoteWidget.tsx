import { lazy, Suspense, useEffect, useState } from 'react';

const RemoteButton = lazy(
  () =>
    import('demo_remote/Button').catch(() => ({
      default: () => (
        <p className="remote-fallback">
          远程模块未启动（pnpm dev:remote @ localhost:3101）
        </p>
      ),
    })) as Promise<{ default: React.ComponentType }>,
);

export function RemoteWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <aside className="remote-widget">
        <h2>Module Federation 远程组件</h2>
        <span className="remote-fallback">远程模块（客户端加载）</span>
      </aside>
    );
  }

  return (
    <aside className="remote-widget">
      <h2>Module Federation 远程组件</h2>
      <Suspense fallback={<span>加载远程模块…</span>}>
        <RemoteButton />
      </Suspense>
    </aside>
  );
}
