import { create } from 'zustand';

export type AppState = {
  online: boolean;
  isLocalServerRunning: boolean;
};

export type AppAction = {
  updateLocalServerStatus: (
    serverStatus: AppState['isLocalServerRunning']
  ) => void;
};

export const useStore = create<AppState & AppAction>((set) => ({
  online: true,
  isLocalServerRunning: false,
  updateLocalServerStatus: (serverStatus) =>
    set(() => ({
      isLocalServerRunning: serverStatus,
    })),
}));
