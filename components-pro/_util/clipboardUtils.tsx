// 复制文本到剪贴板
export function copyToClipboard() {
  if (navigator.clipboard) {
    return navigator.clipboard;
  }
  return {
    writeText: (text) => new Promise((resolve) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // 将文本框添加到文档并选中文本
      document.body.appendChild(textArea);
      textArea.select();

      // 执行复制命令
      document.execCommand('copy');

      // 清理并删除文本框
      document.body.removeChild(textArea);
      resolve(true);
    }),
  }
}

// 从剪贴板中粘贴文本
export async function pasteFromClipboard(rootEl: HTMLElement) {
  if (navigator.clipboard) {
    return navigator.clipboard.readText();
  }
  return new Promise<string>((resolve) => {
    const focusedCell = document.activeElement;
    const el = document.createElement('input');
    const handlePasteEvent = (event: ClipboardEvent) => {
      el.removeEventListener('paste', handlePasteEvent);
      const text = event.clipboardData && event.clipboardData.getData('text/plain');
      if (focusedCell instanceof HTMLElement) {
        focusedCell.focus({ preventScroll: true });
      }
      el.remove();
      resolve(text || '');
    };

    el.addEventListener('paste', handlePasteEvent);
    rootEl.appendChild(el);
    el.focus({ preventScroll: true });
  });
}
