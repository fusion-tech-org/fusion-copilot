import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'

import { EnvConfigItem } from './interface';

export const useDeveloperStore = create(immer<UseDeveloperState & UserDeveloperAction>(set => ({
  envConfigList: [],
  setEnvConfigList: (envConfigs) => set((state) => {
    state.envConfigList = envConfigs
  }),
  addEnvConfig: envConfig => set(state => state.envConfigList.push(envConfig)),
  removeEnvConfig: id => set(state => {
    const index = state.envConfigList.findIndex(env => env.id === id);

    if (index !== -1) state.envConfigList.splice(index, 1)
  })
})));


export type UseDeveloperState = {
  envConfigList: EnvConfigItem[];
}

export type UserDeveloperAction = {
  setEnvConfigList: (envConfigs: EnvConfigItem[]) => void;
  addEnvConfig: (envConfig: EnvConfigItem) => void;
  removeEnvConfig: (id: number) => void;
};
