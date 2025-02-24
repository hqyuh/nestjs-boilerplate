import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as WinstonDaily from 'winston-daily-rotate-file';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LogFileName = {
  nestjsBoilerPlateServer: 'nestjs-boilerplate-server',
} as const;

type LogFileNameType = (typeof LogFileName)[keyof typeof LogFileName];

type MsgLevelType = (typeof MsgLevel)[keyof typeof MsgLevel];

enum MsgLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export enum MsgIds {
  // Validator
  M001001 = 'M001-001',
  M001002 = 'M001-002',
  M001003 = 'M001-003',
  M001004 = 'M001-004',
  M001005 = 'M001-005',
  M001006 = 'M001-006',
  M001007 = 'M001-007',
  M001008 = 'M001-008',

  // Application
  M002001 = 'M002-001',
  M002002 = 'M002-002',
  M002003 = 'M002-003',
}

const configService = new ConfigService();

const msgInfo = new Map<MsgIds, [MsgLevelType, string]>([
  // File
  [MsgIds.M001001, [MsgLevel.ERROR, '{property} must be a string']],
  [MsgIds.M001002, [MsgLevel.ERROR, '{property} should not empty']],
  [MsgIds.M001003, [MsgLevel.ERROR, '{property} mus be a number']],
  [MsgIds.M001004, [MsgLevel.ERROR, '{property} must be an email']],
  [MsgIds.M001005, [MsgLevel.ERROR, '{property} must be a number string']],
  [MsgIds.M001006, [MsgLevel.ERROR, '{property} must be a date string']],
  [MsgIds.M001007, [MsgLevel.ERROR, '{property} must be at least or equal {constraints.0}']],
  [MsgIds.M001008, [MsgLevel.ERROR, '{property} must be less than or equal {constraints.0}']],

  // Application
  [MsgIds.M002001, [MsgLevel.DEBUG, 'The application is running.']],
  [MsgIds.M002002, [MsgLevel.DEBUG, '']],
  [MsgIds.M002003, [MsgLevel.DEBUG, '']],
]);

class WinstonLogger {
  private _prodTransports: WinstonDaily[];

  private _localTransports: winston.transports.ConsoleTransportInstance[];

  private _loggerWinston: winston.Logger;

  private _logFormat: winston.Logform.Format;

  constructor(
    name: LogFileNameType = 'nestjs-boilerplate-server',
    dir = './logs',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _level = 'info',
    maxSize = '10m',
    maxFiles = '30d'
  ) {
    this._logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.label({ label: name }),
      winston.format.splat(),
      winston.format.printf((info) => this.logFormat(info))
    );

    this._prodTransports = [
      new WinstonDaily({
        dirname: dir,
        filename: `${name}-application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize,
        maxFiles,
      }),
      new WinstonDaily({
        dirname: dir,
        level: 'error',
        filename: `${name}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize,
        maxFiles,
      }),
    ];

    this._localTransports = [new winston.transports.Console({})];

    this._loggerWinston = winston.createLogger({
      format: this._logFormat,
      transports:
        configService.get<string>('NODE_ENV') !== 'development' ? this._prodTransports : this._localTransports,
    });
  }

  /**
   * Formats the log details into a string.
   * @param info - The log details to format.
   * @returns The formatted log details as a string.
   */
  private logFormat(info: winston.Logform.TransformableInfo): string {
    const { timestamp, label, level, msgId, message, parameters, error } = info;
    const parserError = error
      ? Object.getOwnPropertyNames(error).reduce(
          (acc: Record<string, string>, key: string) => ({
            ...acc,
            [key]: error[key],
          }),
          { name: error }
        )
      : undefined;
    const logDetails = {
      timestamp,
      label,
      level,
      messageId: msgId,
      message,
      parameters,
      error: parserError,
    };
    return JSON.stringify(logDetails);
  }

  /**
   * Retrieves the message associated with the provided message ID.
   * @param msgId - The ID of the message to retrieve.
   * @returns The message associated with the provided ID, or an empty string if no message is found.
   */
  public getMessage(msgId: MsgIds): string {
    const [, message] = msgInfo.get(msgId) ?? [];
    return message ?? '';
  }

  /**
   * Logs a message with the provided message ID, error, and parameters.
   * @param msgId - The ID of the message to log.
   * @param error - The error to log, if any.
   * @param parameters - The parameters to log, if any.
   * @returns True if the message was logged successfully, false otherwise.
   */
  private logMessage(msgId: MsgIds, error?: Error | null, parameters?: any): boolean {
    const logData = msgInfo.get(msgId);
    if (!logData) return false;

    try {
      const [level, message] = logData;
      this._loggerWinston.log({
        level,
        msgId,
        message,
        parameters,
        error,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      return false;
    }
  }

  /**
   * Logs a message with the provided message ID and error.
   * @param msgId - The ID of the message to log.
   * @param error - The error to log.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public writeWithError(msgId: MsgIds, error?: Error): boolean {
    return this.logMessage(msgId, error);
  }

  /**
   * Logs a message with the provided message ID, parameters, and error.
   * @param msgId - The ID of the message to log.
   * @param parameters - The parameters to log.
   * @param error - The error to log, if any.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public writeWithParameter(msgId: MsgIds, parameters: any, error?: Error | null): boolean {
    return this.logMessage(msgId, error, parameters);
  }

  /**
   * Logs a message with the provided message ID.
   * @param msgId - The ID of the message to log.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public write(msgId: MsgIds): boolean {
    return this.logMessage(msgId);
  }
}

export const logger = new WinstonLogger();

/**
 * Creates a new instance of the WinstonLogger class with the provided configurations or defaults.
 * @param name - The name of the log file.
 * @param dir - The directory to store the log files.
 * @param level - The level of the logs to write.
 * @param maxSize - The maximum size of the log files.
 * @param maxFiles - The maximum number of log files to keep.
 * @returns A new instance of the WinstonLogger class.
 */
export function createLogger(name: LogFileNameType, dir?: string, level?: string, maxSize?: string, maxFiles?: string) {
  return new WinstonLogger(name, dir, level, maxSize, maxFiles);
}
