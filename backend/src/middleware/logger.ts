import morgan = require('morgan');
import { config } from '../config/env';

// Create custom morgan format
const morganFormat = config.nodeEnv === 'development' 
  ? 'dev' 
  : 'combined';

// Custom token for response time with color
morgan.token('status-color', (_req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  return `\x1b[32m${status}\x1b[0m`; // Green
});

// Development format with colors
const developmentFormat = ':method :url :status-color :response-time ms - :res[content-length]';

export const logger = morgan(
  config.nodeEnv === 'development' ? developmentFormat : morganFormat
);
