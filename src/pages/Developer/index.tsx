import { TabsProps, Tabs, message, Button } from 'antd';
import { invoke } from '@tauri-apps/api';
import {
  readDir,
  BaseDirectory,
  readTextFile,
  removeDir,
  removeFile,
  readBinaryFile,
} from '@tauri-apps/api/fs';
import {
  appLocalDataDir,
  resolve,
  resolveResource,
} from '@tauri-apps/api/path';
import { Child, Command, open } from '@tauri-apps/api/shell';
import { useCallback, useEffect, useState } from 'react';

import { DeploymentManage } from './components/DeploymentManage';
import { ToolManage } from './components/ToolManage';
import { Link } from 'react-router-dom';
import {
  HomeOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { find, orderBy, remove } from 'lodash';
import { MyLink } from 'components/index';
import { LocalAppItem, RemoteAppItem } from './interface';
import { DB_CUD_SUCCESS_FLAG } from 'constants/index';

const VALID_PACKAGE_PREFIX = '紫薇';

export interface PackageList {
  aid: string;
  name: string;
  path: string;
}

type PositionType = 'left' | 'right';
type TabsItems = 'deployment_manage' | 'tools_manage';

export const DeveloperPage = () => {
  const [availableApps, setAvailableApps] = useState<RemoteAppItem[]>([]);
  const [activeTabItem, setActiveTabItem] =
    useState<TabsItems>('deployment_manage');

  const onChange = (key: string) => {
    setActiveTabItem(key as TabsItems);
  };

  const queryLocalApps = async () => {
    const entries = await readDir('', {
      dir: BaseDirectory.Download,
      recursive: false,
    });
    const validLocalApps = [];
    const validAppFileRE = new RegExp(
      `^(${VALID_PACKAGE_PREFIX}).*(?<=_)([a-z0-9]{24})(?=_).*(\.zip)$`,
      'ig'
    );
    // const appIdRE = /.*(?<=_)([a-z0-9]{24})(?=_).*/i;
    // const splitFileNameRE = new RegExp(
    //   `^(${VALID_PACKAGE_PREFIX}).*(?<=_)([a-z0-9]{24})(?=_).*(\.zip)$`,
    //   'ig'
    // );

    for (const entry of entries) {
      const entryName = entry.name || '';

      if (validAppFileRE.test(entryName)) {
        const [appFileName, _] = entryName.split('.zip');
        const [_prefix, appName, appId, appVersion] =
          appFileName?.split('_') ?? [];

        const packItem = {
          aid: appId,
          name: appName,
          localPath: entry.path,
          version: appVersion,
        };

        validLocalApps.push(packItem);
      }
    }

    const orderedApps = orderBy(validLocalApps, ['aid'], ['asc']);

    return orderedApps;
  };

  const handleUnzipPackage = useCallback(async (sourceFile: string) => {
    const targetDir = await appLocalDataDir();
    const msg: string = await invoke('unzip_file', {
      sourceFile: sourceFile,
      targetDir,
    });

    console.log(msg);

    message.info(msg);
  }, []);

  const handleStartApp = async (appId: string) => {
    const targetDir = await appLocalDataDir();
    // const pendingApp = `${targetDir}${appId}/lowcode-app.jar`;
    // const logPath = `${targetDir}${appId}/app.log`;
    const pendingAppPath = await resolve(targetDir, appId, 'lowcode-app.jar');
    const logPath = await resolve(targetDir, appId, 'appLog');
    console.log('pendingAppPath', pendingAppPath);
    // const resourceAppFile = await resolveResource(pendingAppPath);
    // const resourceAppLogFile = await resolveResource(logPath);

    const cmdRes = await new Command('run-start-app', [
      '-jar',
      pendingAppPath,
      '--spring.profiles.active=test',
      '--filter.enable=false',
      '>>',
      logPath,
      '2>&1',
      '&',
    ]).execute();

    // command.on('close', (data) => {
    //   console.log('data', data);
    //   console.log(
    //     `command finished with code ${data.code} and signal ${data.signal}`
    //   );
    // });

    // command.on('error', (error) => console.error(`command error: "${error}"`));
    // command.stdout.on('data', (line) =>
    //   console.log(`command stdout: "${line}"`)
    // );
    // command.stderr.on('data', (line) =>
    //   console.log(`command stderr: "${line}"`)
    // );
    console.log(cmdRes.stdout);
    console.log(cmdRes.stderr);

    // const child = await command.spawn();
    // const res = await child.write('message');
    // console.log(res);
    // console.log('pid: ', child.pid);
  };

  const handleStopApp = async (appId: string) => {
    const resourcePath = await resolveResource('scripts/query_app_pid.sh');
    const execRes = await new Command('run-sh-file', resourcePath).execute();
    console.log(execRes);
    if (execRes.code === 0 && execRes.stdout) {
      console.log(execRes.stdout);

      const killProcess = await new Command(
        'run-kill-app',
        execRes.stdout
      ).execute();
      console.log(killProcess);
    }
  };

  const handleUpdateApp = async (appId: string) => {
    // const resourcePath = await resolveResource('lang/de.json');

    // const langDe = JSON.parse(await readTextFile(resourcePath));

    // console.log(langDe.hello);
    const res = await invoke('toggle_app_running_status', {
      appRunningStatus: true,
      appKey: 1,
    });

    console.log(res, 'res');
  };

  const handleQueryAppDetail = async (appId: string) => {
    const res: string = await invoke('get_app_by_id', {
      appKey: 1,
    });

    console.log(JSON.parse(res));
  };

  const handleDelApp = async (appId: string, zipName: string) => {
    // try {
    //   await removeDir(appId, {
    //     dir: BaseDirectory.AppLocalData,
    //     recursive: true,
    //   });
    //   await removeFile(zipName, {
    //     dir: BaseDirectory.Download,
    //   });
    //   message.success('文件删除成功');
    // } catch (err) {
    //   console.error(err);
    //   message.info('文件删除失败');
    // }
    const res = await invoke('del_app_by_id', {
      appKey: 1,
    });

    console.log(res, 'res');
  };

  const saveAppToDB = async (newApp: LocalAppItem) => {
    try {
      const { aid, version, name, localPath } = newApp;
      await invoke('create_ziwei_app', {
        name,
        newAppId: aid,
        version,
        localAppPath: localPath,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const removeAppById = async (appPrimaryKey: number) => {
    try {
      const delRes = await invoke('del_app_by_id', {
        appKey: appPrimaryKey,
      });

      if (delRes === DB_CUD_SUCCESS_FLAG) {
        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const handleDelAllApps = async () => {
    const queryApps = await invoke('query_ziwei_apps');

    console.log('queryApps', queryApps);
  };
  const queryRemoteApps = async () => {
    try {
      const queryApps = await invoke('query_ziwei_apps');

      if (!(queryApps as RemoteAppItem[])?.length) {
        return [];
      }

      return queryApps as RemoteAppItem[];
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  const compareLocalAppToRemote = async () => {
    const localApps = await queryLocalApps();
    const remoteApps = await queryRemoteApps();
    const processedApps = remoteApps;

    console.log(localApps, remoteApps);
    /**
     * NOTE: Base on local apps to create new app
     */
    for (let i = 0; i < localApps.length; i++) {
      const curLocalApp = localApps[i];

      if (find(remoteApps, ['app_id', curLocalApp.aid])) continue;

      await saveAppToDB(curLocalApp);
    }

    /**
     * NOTE: Base on local apps to delete are those removed local apps manually
     */
    for (let i = 0; i < remoteApps.length; i++) {
      const curRemoteApp = remoteApps[i];
      const curAppId = curRemoteApp.app_id;

      if (find(localApps, ['aid', curAppId])) continue;

      await removeAppById(curRemoteApp.id);

      remove(processedApps, (app) => app.app_id === curAppId);
    }

    setAvailableApps(processedApps);
  };

  useEffect(() => {
    /**
     * NOTE: Comparing apps of local directory with sqlite's storing apps
     */
    compareLocalAppToRemote();
  }, []);

  const items: TabsProps['items'] = [
    {
      key: 'deployment_manage',
      label: `部署管理`,
      children: (
        <DeploymentManage
          onUnZip={handleUnzipPackage}
          onStartup={handleStartApp}
          onStop={handleStopApp}
          onUpdate={handleUpdateApp}
          onDelete={handleDelApp}
          availableApps={availableApps}
        />
      ),
    },
    {
      key: 'tools_manage',
      label: '工具管理',
      children: <ToolManage />,
    },
  ];

  const OperationsSlot: Record<PositionType, React.ReactNode> = {
    left: null,
    right: (
      <div className="flex items-center">
        <div
          className="cursor-pointer hover:text-primary duration-300"
          onClick={compareLocalAppToRemote}
        >
          <ReloadOutlined />
          <span className="pl-1.5">文件重载</span>
        </div>
        <div
          className="ml-4 cursor-pointer hover:text-rose-500 duration-300"
          onClick={handleDelAllApps}
        >
          <DeleteOutlined />
          <span className="pl-1.5">删除全部</span>
        </div>
      </div>
    ),
  };

  return (
    <section className="h-screen p-4 overflow-hidden">
      <div className="flex flex-col items-center mb-4">
        <p className="text-3xl mb-2">开发者</p>
        <div className="flex items-center text-sm">
          <Link
            to="/"
            className="flex items-center cursor-pointer text-[#333] no-underline hover:text-primary"
          >
            <HomeOutlined />
            <span className="px-1">·</span>
            <span>首页</span>
          </Link>
          <div className="mx-2 text-slate-300">/</div>
          <MyLink to="/developer/global-setting">
            <SettingOutlined />
            <span className="px-1">·</span>
            <span>我的设置</span>
          </MyLink>
        </div>
      </div>
      <Tabs
        defaultActiveKey="deployment_manage"
        items={items}
        onChange={onChange}
        tabBarExtraContent={
          activeTabItem === 'deployment_manage' ? OperationsSlot : null
        }
      />
    </section>
  );
};
