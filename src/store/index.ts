import { create } from 'zustand';

export type AppState = {
  isLocalServerRunning: boolean;
};

export type AppAction = {
  updateLocalServerStatus: (
    serverStatus: AppState['isLocalServerRunning']
  ) => void;
};

export const useStore = create<AppState & AppAction>((set) => ({
  isLocalServerRunning: false,
  updateLocalServerStatus: (serverStatus) =>
    set(() => ({
      isLocalServerRunning: serverStatus,
    })),
}));
