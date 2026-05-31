export {};

declare global {
  interface Window {
    electronAPI?: {
      startLockdown: (options?: { durationMinutes: number }) => Promise<boolean>;
      endLockdown: () => Promise<boolean>;
      getLockdownStatus: () => Promise<{ 
        isLocked: boolean; 
        focusTimerEnd: number | null; 
        remainingMs: number;
        lockdownStartTime: number | null;
      }>;
      onLockdownAutoEnded: (callback: () => void) => void;
      onLockdownForceEnded: (callback: () => void) => void;
      onLockdownRestore: (callback: (data: { isLocked: boolean; focusTimerEnd: number | null; remainingMs: number; lockdownStartTime: number | null }) => void) => void;
      onLockdownExitBlocked: (callback: () => void) => void;
      removeLockdownListener: () => void;
      removeAllLockdownListeners: () => void;
      clearCache?: () => Promise<boolean>;
      storage: {
        set: (key: string, value: any) => Promise<boolean>;
        get: (key: string) => Promise<any>;
        delete: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
      };
    };
    reactNativeAPI?: {
      startLockTask: () => Promise<void>;
      stopLockTask: () => Promise<void>;
      isLockTaskActive: () => Promise<boolean>;
    };
    appInfo?: {
      version: string;
      platform: string;
      isDev: boolean;
    };
  }
}