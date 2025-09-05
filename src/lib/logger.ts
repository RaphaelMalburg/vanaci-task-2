export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  prefix?: string
}

export class Logger {
  private static instance: Logger
  private config: LoggerConfig

  constructor(config: LoggerConfig = { level: LogLevel.INFO, enableConsole: true }) {
    this.config = config
  }

  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  static configure(config: LoggerConfig): void {
    Logger.instance = new Logger(config)
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enableConsole && level <= this.config.level
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : ''
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `${timestamp} ${prefix}[${level}] ${message}${dataStr}`
  }

  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, data))
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data))
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, data))
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, data))
    }
  }
}

// Instância global configurada para produção
export const logger = Logger.getInstance({
  level: process.env.NODE_ENV === 'development' ? LogLevel.WARN : LogLevel.ERROR,
  enableConsole: true,
  prefix: 'Farmacia'
})