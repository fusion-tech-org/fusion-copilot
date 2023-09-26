import { resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { get } from "lodash";

export const stopApp = async (port?: number) => {
  try {
    const resourcePath = await resolveResource('scripts/query_app_pid.sh');
    const execRes = await new Command('run-sh-file', resourcePath).execute();

    if (execRes.code === 0 && execRes.stdout) {
      const killProcess = await new Command(
        'run-kill-app',
        execRes.stdout
      ).execute();

      return killProcess.code === 0;
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