import pino from 'pino';

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = pino({
  level,
  base: { service: process.env.SERVICE_NAME || 'omni-back' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.token'],
    censor: '[REDACTED]',
  },
});
