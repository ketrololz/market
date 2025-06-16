import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('appLogger', () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  const consoleDebugSpy = vi
    .spyOn(console, 'debug')
    .mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('when logging is enabled (VITE_APP_LOGGING_ENABLED=true)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_LOGGING_ENABLED', 'true');
    });

    it('log() should call console.log', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.log('test log');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('test log');
    });

    it('warn() should call console.warn', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.warn('test warn');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith('test warn');
    });

    it('error() should call console.error', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('test error');
    });

    it('info() should call console.info', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.info('test info');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test info');
    });

    describe('debug()', () => {
      it('should call console.debug when DEV is true', async () => {
        vi.stubEnv('DEV', true);
        const { default: appLogger } = await import('./logger');
        appLogger.debug('test debug');
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          '%cDEBUG:',
          'color: blue; font-weight: bold;',
          'test debug',
        );
      });

      it('should NOT call console.debug when DEV is false', async () => {
        vi.stubEnv('DEV', false);
        const { default: appLogger } = await import('./logger');
        appLogger.debug('test debug');
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when logging is disabled (VITE_APP_LOGGING_ENABLED=false)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_LOGGING_ENABLED', 'false');
    });

    it('log() should NOT call console.log', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.log('test log');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('warn() should NOT call console.warn', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.warn('test warn');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('error() should still call console.error (as per current logic)', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.error('test error');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('info() should NOT call console.info', async () => {
      const { default: appLogger } = await import('./logger');
      appLogger.info('test info');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('debug() should NOT call console.debug (regardless of DEV mode)', async () => {
      vi.stubEnv('DEV', true);
      const { default: appLogger } = await import('./logger');
      appLogger.debug('test debug');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });
});
