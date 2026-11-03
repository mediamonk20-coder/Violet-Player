import { SubtitleCue, SubtitleTrack } from '../types/media';

/**
 * Converts timestamp string (00:01:23,456 or 00:01:23.456) to seconds
 */
export function timeStringToSeconds(timeStr: string): number {
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Parses SRT or WebVTT raw text into SubtitleCue items
 */
export function parseSubtitleText(content: string, label: string = 'External Subtitle'): SubtitleTrack {
  const cues: SubtitleCue[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  let i = 0;
  // Skip WEBVTT header if present
  if (lines[0] && lines[0].startsWith('WEBVTT')) {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '') {
      i++;
    }
  }

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // Check if line contains timestamp separator `-->`
    if (line.includes('-->')) {
      const parts = line.split('-->');
      if (parts.length === 2) {
        const start = timeStringToSeconds(parts[0]);
        // Strip out any WebVTT position styling after end time
        const endPart = parts[1].trim().split(/\s+/)[0];
        const end = timeStringToSeconds(endPart);

        i++;
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          // Remove SRT styling tags like <i>, <b>, <font>
          const cleanedText = lines[i].replace(/<[^>]*>/g, '').trim();
          if (cleanedText) {
            textLines.push(cleanedText);
          }
          i++;
        }

        if (textLines.length > 0) {
          cues.push({
            id: String(cues.length + 1),
            startTime: start,
            endTime: end,
            text: textLines.join('\n'),
          });
        }
      }
    }
    i++;
  }

  return {
    id: 'sub_' + Math.random().toString(36).substring(2, 8),
    label,
    language: 'en',
    cues,
  };
}

/**
 * Finds the active cue for the given timestamp factoring in delay offset
 */
export function getActiveCue(cues: SubtitleCue[], currentTime: number, delayOffset: number = 0): SubtitleCue | null {
  const targetTime = currentTime - delayOffset;
  for (const cue of cues) {
    if (targetTime >= cue.startTime && targetTime <= cue.endTime) {
      return cue;
    }
  }
  return null;
}
