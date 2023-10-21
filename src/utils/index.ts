import { resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { get } from "lodash";
import { platform, Platform } from '@tauri-apps/api/os';



export const isSpecialPlatform = async (platformName: Platform) => {
  const curPlatform = await platform();

  return platformName === curPlatform;
};

export const isWin32 = async () => await isSpecialPlatform('win32');

export const isMac = async () => await isSpecialPlatform('darwin');

export const isLinux = async () => await isSpecialPlatform('linux');

export const stopApp = async (port?: number) => {
  try {
    const isWinSys = await isWin32();
    const queryPidPath = isWinSys ? await resolveResource('scripts/first_batch.bat') : await resolveResource('scripts/query_app_pid.sh');

    let execRes: Record<string, any> = {};

    if (isWinSys) {
      execRes = await new Command('run-bat-file', queryPidPath).execute();
    } else {
      execRes = await new Command('run-sh-file', queryPidPath).execute();
    }

    console.log(port);
    console.log(execRes);
    // if (execRes.code === 0 && execRes.stdout) {
    //   const killProcess = await new Command(
    //     'run-kill-app',
    //     execRes.stdout
    //   ).execute();

    //   return killProcess.code === 0;
    // }

    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getAppNameFromPath = (localPath: string) => {
  return localPath.split('/').pop();
};

export interface ZiWeiResponse {
  data: unknown;
  responseMeta: {
    status: number;
    success: boolean
  }
  [index: string]: unknown;
}
export const checkValidResponseForZiWei = (res: ZiWeiResponse) => {
  return get(res, 'responseMeta.success', false);
};