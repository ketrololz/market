const IS_LOGGING_ENABLED = import.meta.env.VITE_APP_LOGGING_ENABLED === 'true';
const IS_DEV_MODE = import.meta.env.DEV;

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const appLogger: Logger = {
  log: (...args: unknown[]): void => {
    if (IS_LOGGING_ENABLED) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (IS_LOGGING_ENABLED) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (IS_LOGGING_ENABLED) {
      console.error(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (IS_LOGGING_ENABLED) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]): void => {
    if (IS_LOGGING_ENABLED && IS_DEV_MODE) {
      console.debug('%cDEBUG:', 'color: blue; font-weight: bold;', ...args);
    }
  },
};

export default appLogger;
