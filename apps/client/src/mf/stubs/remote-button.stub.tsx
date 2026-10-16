/** SSR 构建占位：远程模块仅在浏览器通过 MF 加载 */
export default function RemoteButtonStub() {
  return <span className="remote-fallback">远程模块（客户端加载）</span>;
}
