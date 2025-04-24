export {};

declare global {
  // 👇 Giữ nguyên backend như bạn yêu cầu
  declare const backend: typeof import("./preload").backend;

  // 👇 Mở rộng thêm window.electron.ipcRenderer.on
  interface Window {
    electron: {
      ipcRenderer: {
        on: (channel: string, callback: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
        invoke?: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}
