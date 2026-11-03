/**
 * Formats time in seconds to HH:MM:SS or MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  if (h > 0) {
    const hh = String(h).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Formats bytes into human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Generates an M3U playlist file content
 */
export function generateM3U(items: { title: string; duration: number; src: string; artist?: string }[]): string {
  let content = '#EXTM3U\n';
  for (const item of items) {
    const duration = Math.floor(item.duration);
    const label = item.artist ? `${item.artist} - ${item.title}` : item.title;
    content += `#EXTINF:${duration},${label}\n`;
    content += `${item.src}\n`;
  }
  return content;
}

/**
 * Parses an M3U playlist file content
 */
export function parseM3U(content: string): { title: string; duration: number; src: string }[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const items: { title: string; duration: number; src: string }[] = [];

  let currentTitle = '';
  let currentDuration = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#EXTINF:')) {
      // #EXTINF:123,Artist - Title
      const match = trimmed.substring(8).match(/^(-?\d+),(.*)$/);
      if (match) {
        currentDuration = Math.max(0, parseInt(match[1], 10) || 0);
        currentTitle = match[2].trim();
      }
    } else if (!trimmed.startsWith('#')) {
      // Line is URL or file path
      const src = trimmed;
      const title = currentTitle || src.split('/').pop()?.split('\\').pop() || 'Untitled Media';
      items.push({
        title,
        duration: currentDuration,
        src,
      });
      currentTitle = '';
      currentDuration = 0;
    }
  }

  return items;
}
