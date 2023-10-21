import { resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { invoke } from '@tauri-apps/api';
import { get, map, toNumber } from "lodash";
import { platform, Platform } from '@tauri-apps/api/os';
import { RUN_SHELL_SUCCESS } from "constants/index";



export const isSpecialPlatform = async (platformName: Platform) => {
  const curPlatform = await platform();

  return platformName === curPlatform;
};

export const isWin32 = async () => await isSpecialPlatform('win32');

export const isMac = async () => await isSpecialPlatform('darwin');

export const isLinux = async () => await isSpecialPlatform('linux');

interface WinProcessInfo {
  proto: 'TCP' | 'UDP';
  localAddr: string;
  foreignAddr: string;
  state?: 'LISTENING' | 'ESTABLISHED' | 'CLOSE_WAIT' | 'TIME_WAIT';
  pid: string;
}
const getProcessByPortForWin= async (port: number): Promise<WinProcessInfo[]> => {
  try {
    const output = await new Command("run-ps", ["netstat", "-nao", "|", "findstr", `${port}`], {
      "encoding": "utf-8"
    }).execute();
  
    if (output.code === 0) {
      const stdout = output.stdout;
    
      const processList: Array<string> = stdout.split("\r\n");
    
      const allProcesses = map(processList, item => {
        const info = item.split(/\s+/);
    
        return info.filter(Boolean)
      });

      return map(allProcesses, (pro) => {
        return {
          proto: pro[0],
          localAddr: pro[1],
          foreignAddr: pro[2],
          state: pro[3],
          pid: pro[4],
        } as WinProcessInfo;
      })
    }
  
  return [];
  } catch (e) {
    console.log(e)
    return [];
  }
}

export const killProcessByPIDForWin = async (pid: string) => {
  try {
   const output = await new Command("run-ps", ["taskkill", '/pid', pid, '/F'
  ], {
    encoding: 'utf-8'
   }).execute();

   if (output.code === RUN_SHELL_SUCCESS) {
    return true;
   }

   return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};


export const stopLowCodeApp = async (appPort: number) => {
  const isWinSys = await isWin32();
  let pid: string | number;
  if (isWinSys) {
    const processList = await getProcessByPortForWin(appPort);

    pid = processList[0].pid;

    return await killProcessByPIDForWin(pid);
  } else {
    const res = await invoke('get_process_by_port_for_unix', {
      port: appPort
    })
    console.log(res);
  }
};

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