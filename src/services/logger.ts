import { DiagnosticLog } from '../types/media';

class DiagnosticLogger {
  private logs: DiagnosticLog[] = [];
  private listeners: ((logs: DiagnosticLog[]) => void)[] = [];

  constructor() {
    this.info('SYSTEM', 'Violet Media Player initialized (Engine: HTML5/WebAudio Hardware Accelerated)');
    this.info('DECODER', 'D3D11VA Hardware Acceleration enabled for video decoders (H.264, HEVC, AV1)');
    this.info('AUDIO', 'WASAPI audio pipeline initialized with low-latency direct buffer');
  }

  public log(level: DiagnosticLog['level'], category: string, message: string) {
    const entry: DiagnosticLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString().substring(11, 19),
      level,
      category,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 500) {
      this.logs.pop();
    }
    this.listeners.forEach((listener) => listener(this.logs));
  }

  public info(category: string, message: string) {
    this.log('info', category, message);
  }

  public warn(category: string, message: string) {
    this.log('warn', category, message);
  }

  public error(category: string, message: string) {
    this.log('error', category, message);
  }

  public debug(category: string, message: string) {
    this.log('debug', category, message);
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }

  public subscribe(listener: (logs: DiagnosticLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public clear() {
    this.logs = [];
    this.listeners.forEach((listener) => listener(this.logs));
  }

  public exportLogs(): string {
    return this.logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}`)
      .reverse()
      .join('\n');
  }
}

export const logger = new DiagnosticLogger();
