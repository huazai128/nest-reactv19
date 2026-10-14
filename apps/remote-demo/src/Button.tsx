export default function Button() {
  return (
    <button type="button" onClick={() => alert('来自 MF 远程模块')}>
      远程按钮
    </button>
  );
}
