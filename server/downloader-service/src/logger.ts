import chalk from 'chalk';
import {createLogger, format, transports} from 'winston';
import {TransformableInfo} from 'logform';
import path from 'path';

const {combine, timestamp, printf} = format;

const levels = {error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6};
const colors = {error: 'red', warn: 'yellow', info: 'green', http: 'green', debug: 'cyan', silly: 'black', verbose: 'cyan'};

/**
 * Logger format used by {@link transports.Console}
 */
const consoleFormat = printf((info: TransformableInfo) => {
  return `${chalk.gray(info.timestamp)} ` +
    `${chalk[colors[info.level]](info.level.toUpperCase().padStart(7, ' '))}: ` +
    `${chalk.magenta(info.label.padEnd(20, ' ') + ':')} ` +
    `${chalk.gray(info.message)}`;
});

const winstonLogger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports: [
    new transports.Console({
      format: combine(timestamp(), consoleFormat)
    })
  ]
});

/**
 * Wrapper around winston logger
 */
export class Logger {
  /**
   * absolute path to file
   */
  private file: string;

  constructor(file: string) {
    this.file = path.relative(process.cwd(), file); // get the path relative to the project folder
  }

  error(msg: string | any) {
    winstonLogger.error(msg, {label: this.file});
  }

  warn(msg: string | any) {
    winstonLogger.warn(msg, {label: this.file});
  }

  info(msg: string | any) {
    winstonLogger.info(msg, {label: this.file});
  }

  http(msg: string | any) {
    winstonLogger.http(msg, {label: this.file});
  }

  verbose(msg: string | any) {
    winstonLogger.verbose(msg, {label: this.file});
  }

  debug(msg: string | any) {
    winstonLogger.debug(msg, {label: this.file});
  }

  silly(msg: string | any) {
    winstonLogger.silly(msg, {label: this.file});
  }
}

/**
 * Factory for creating {@link Logger} with predefined filename
 */
export class LoggerFactory {
  /**
   * @param file absolute path to file
   */
  public static getLogger(file: string) : Logger {
    return new Logger(file);
  }
}

export default {Logger, LoggerFactory};
