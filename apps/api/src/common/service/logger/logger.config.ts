import winston, { createLogger, format, transports } from 'winston';
export const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7,
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow',
  },
};

winston.addColors(config.colors);
export const logger = createLogger({
  level: 'info', // 仅当 info.level 小于或等于此级别时才记录
  levels: winston.config.npm.levels,
  // winston 格式定义
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),

  // 生成文件

  // winston 文档中使用的方法为 new transports.File()

  // 因为加入日志归档等相关功能，所以使用transports.DailyRotateFile()方法来实现

  transports: [
    // 打印到控制台，生产可注释关闭该功能
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});
