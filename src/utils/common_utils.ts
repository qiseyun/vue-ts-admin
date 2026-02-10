// 复制文本
import {ElMessage} from "element-plus";

export async function copyText(text: string | undefined): Promise<void> {
  if (text) {
    try {
      await navigator.clipboard.writeText(text);
      ElMessage.success('已复制: ' + text);
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
      // 可选：降级到旧方法（仅在必要时）
      fallbackCopyText(text);
    }
  }
}

// 降级方案（仅用于兼容不支持 Clipboard API 的旧环境）
function fallbackCopyText(text: string): void {
  const input = document.createElement('input');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  ElMessage.success('已复制: ' + text);
}