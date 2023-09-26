import { useEffect, useState } from 'react';
import {
  HomeOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import {
  readDir,
  BaseDirectory,
  removeDir,
  removeFile,
  exists,
} from '@tauri-apps/api/fs';
import { TabsProps, Tabs, message, Modal } from 'antd';
import { MyLink } from 'components/index';
import { DB_CUD_SUCCESS_FLAG } from 'constants/index';
import { find, orderBy, remove } from 'lodash';
import { Link } from 'react-router-dom';
import { getAppNameFromPath, stopApp } from 'utils/index';
import { DeploymentManage } from './components/DeploymentManage';
import { ToolManage } from './components/ToolManage';
import { LocalAppItem, RemoteAppItem } from './interface';

const VALID_PACKAGE_PREFIX = '紫薇';

export interface PackageList {
  aid: string;
  name: string;
  path: string;
}

type PositionType = 'left' | 'right';
type TabsItems = 'deployment_manage' | 'tools_manage';

const { confirm } = Modal;

export const DeveloperPage = () => {
  const [availableApps, setAvailableApps] = useState<RemoteAppItem[]>([]);
  const [activeTabItem, setActiveTabItem] = useState<TabsItems>('deployment_manage');

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
      // eslint-disable-next-line no-useless-escape
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
        const [_prefix, appName, appId, appVersion] = appFileName?.split('_') ?? [];

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

      await removeDBAppById(curRemoteApp.id);

      remove(processedApps, app => app.app_id === curAppId);
    }

    setAvailableApps(processedApps);
  };

  const handleDelApp = async (appItem: RemoteAppItem, showMsg = true) => {
    const { id, is_running, app_id, local_path } = appItem;
    const appFullName = getAppNameFromPath(local_path)!;

    try {
      // if the app is running, we should to stop it first
      if (is_running) {
        const isSuccess = await stopApp();

        if (!isSuccess) {
          message.info('关闭应用服务失败，请稍后重试!');
          return;
        }
      }

      /**
       * NOTE: check the corresponding fold whether existed
       *
       * we can judge it via `unzipped` property, but in specific scenario that user remove them manually, it'll not work.
       */
      const isUnzipFoldExist = await exists(app_id, {
        dir: BaseDirectory.AppLocalData,
      });

      if (isUnzipFoldExist) {
        // remove unzip directory
        await removeDir(app_id, {
          dir: BaseDirectory.AppLocalData,
          recursive: true,
        });
      }

      const isZipFileExist = await exists(appFullName, {
        dir: BaseDirectory.Download,
      });

      if (isZipFileExist) {
        // remove app zip file
        await removeFile(appFullName, {
          dir: BaseDirectory.Download,
        });
      }

      // remove record from database
      await invoke('del_app_by_id', {
        appKey: id,
      });

      await compareLocalAppToRemote();

      showMsg && message.success('文件删除成功');
    } catch (err) {
      console.error(err);
      showMsg && message.info('文件删除失败');
    }
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

  const removeDBAppById = async (appPrimaryKey: number) => {
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

  const confirmDelAllApps = async () => {
    try {
      for (let i = 0; i < availableApps.length; i++) {
        await handleDelApp(availableApps[i], false);
      }

      setAvailableApps([]);
      message.success('删除全部应用成功');
    } catch (e) {
      console.error(e);

      message.info('删除全部应用失败');
    }
  };

  const handleDelAllApps = () => {
    confirm({
      title: '请再次确认是否清空所有数据',
      icon: <ExclamationCircleFilled />,
      content: '该操作会删除所有相关的安装包以及文件',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        confirmDelAllApps();
      },
      onCancel() { },
    });
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
      children: <DeploymentManage onDelete={handleDelApp} availableApps={availableApps} />,
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
        tabBarExtraContent={activeTabItem === 'deployment_manage' ? OperationsSlot : null}
      />
    </section>
  );
};
