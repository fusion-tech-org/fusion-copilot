import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Descriptions, Space, message } from 'antd';
import { LeftCircleOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import { isArray, isEmpty, isString, toNumber } from 'lodash';
import {
  appLocalDataDir,
  resolve,
} from '@tauri-apps/api/path';
// import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
import { Command } from '@tauri-apps/api/shell';

import {
  AppDetailContainer,
  AppDetailLog,
  AppDetailLogWrapper,
} from './styles';
import { MyLink } from 'components/index';
import { ActionValue, RemoteAppItem } from './interface';
import { ActionList } from './constants';
import { stopApp } from 'utils/index';

const DescriptionItem = Descriptions.Item;

export const PageAppDetail = () => {
  const { id } = useParams();
  const [appDetail, setAppDetail] = useState<RemoteAppItem | null>(null);
  const appKey = toNumber(id);
  const [startingApp, setStartingApp] = useState(false);
  const [startLogs, setStartLogs] = useState('');

  // const getAppDir = async () => {
  //   if (!appDetail || !appDetail.unzipped) {
  //     message.info('当前应用不存在或未解压');
  //     return;
  //   };

  //   const { app_id } = appDetail;

  //   const localDataDir = await appLocalDataDir();
  //   const appDirPath = await resolve(localDataDir, app_id);

  //   return appDirPath;
  // };

  const handleToggleAppZipStatus = async (zipStatus: boolean) => {
    if (!appDetail) return;

    const appStr: string = await invoke('toggle_app_zip_status', {
      appKey,
      appZipStatus: zipStatus
    });

    console.log(appStr, 'appStr');

    setAppDetail({
      ...appDetail,
      unzipped: zipStatus,
    })
    message.success('解压成功');
  }

  const handleToggleAppRunStatus = async (runStatus: boolean) => {
    if (!appDetail) return;

    const res: number = await invoke('toggle_app_running_status', {
      appKey,
      appRunningStatus: runStatus
    });

    console.log(res, 'res', typeof res);

    if (res === 1) {
      setAppDetail({
        ...appDetail,
        is_running: runStatus,
      })
    }
  }

  const handleUnzipPackage = async (sourceFilePath: string) => {
    try {
      const targetDir = await appLocalDataDir();

      const msg: boolean = await invoke('unzip_file', {
        sourceFile: sourceFilePath,
        targetDir,
      });

      if (msg === true) {
        handleToggleAppZipStatus(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // const persistLogs = debounce(async (appId: string) => {
  //   await writeTextFile(`${appId}/app.log`, startLogs, {
  //     dir: BaseDirectory.AppLocalData
  //   })
  // }, 800)

  const recordAndPersistLogs = (data: string) => {
    setStartLogs((prevLog => prevLog + data))
  };

  const handleStartApp = async (appId: string) => {
    try {
      setStartingApp(true);
      const targetDir = await appLocalDataDir();
      const pendingAppPath = await resolve(targetDir, appId, 'lowcode-app.jar');
      // const logPath = await resolve(targetDir, appId, 'appLog');

      const cmd = new Command('run-start-app', [
        '-jar',
        pendingAppPath,
        '--spring.profiles.active=test',
        '--filter.enable=false',
      ]);

      cmd.on('close', (data) => {
        console.log(
          `command finished with code ${data.code} and signal ${data.signal}`
        );
        setStartingApp(false);
      });
      cmd.stdout.once('data', () => {
        handleToggleAppRunStatus(true);
      })

      cmd.stdout.on('data', data => {
        recordAndPersistLogs(data);
      }
      );

      cmd.on('error', (error) => {
        if (appDetail?.is_running) {
          handleToggleAppRunStatus(false);
        }
        console.error(`command error: "${error}"`);
        setStartingApp(false);
      });

      await cmd.execute();
    } catch (e) {
      setStartingApp(false);
      console.log('Starting up the app failed', e);
    }

  };

  const handleStopApp = async () => {
    setStartingApp(false);

    const isSuccess = await stopApp();

    if (isSuccess) {
      handleToggleAppRunStatus(false);
    }
  };

  const ACTION_MAP_INVOKE: Record<
    ActionValue,
    {
      name?: string;
      params?: string[] | string;
      func?: (params: any) => void;
    }
  > = {
    unzip: {
      func: handleUnzipPackage,
      params: 'sourceFilePath'
    },
    startup: {
      func: handleStartApp,
      params: 'appId'
    },
    stop: {
      func: handleStopApp,
      params: 'appId'
    },
    delete: {
      name: 'del_app_by_id',
      params: ['appKey'],
    },
  };

  const handleAppAction = (action: ActionValue) => async () => {
    const { func, params, name } = ACTION_MAP_INVOKE[action];
    let convertParams: Record<string, any> | string;
    const paramMap: Record<string, any> = {
      sourceFilePath: 'local_path',
      appId: 'app_id',
      appKey: 'id',
      appRunningStatus: ''
    };

    if (isString(params) && !!func) {
      convertParams = appDetail?.[paramMap[params]];

      func?.(convertParams);

      return;
    }

    if (isArray(params) && !!name) {
      convertParams = {};

      params.forEach(key => {
        (convertParams as Record<string, any>)[key] = appDetail?.[paramMap[key]];
      })

      const res = await invoke(convertParams as any);

      console.log(res);
    }
  };

  const [appName, setAppName] = useState('未命名应用');

  const initAppDetail = async () => {
    try {
      const appStr: string = await invoke('get_app_by_id', {
        appKey: toNumber(id),
      });
      const parsedAppDetail: RemoteAppItem = JSON.parse(appStr);

      const { app_name } = parsedAppDetail;

      setAppName(app_name);
      setAppDetail(parsedAppDetail);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    initAppDetail();
  }, []);

  const {
    app_id = '/',
    app_version = '/',
    created_at = '/',
    unzipped = false,
    local_path = '/',
    is_running = false,
  } = (appDetail || {}) as RemoteAppItem;
  const isDisableAction = isEmpty(appDetail);

  return (
    <AppDetailContainer>
      <div>
        <Descriptions
          size="small"
          title={
            <div className="flex items-center">
              <MyLink
                to="/developer"
                className="pr-4 text-lg font-normal !text-gray-6"
              >
                <LeftCircleOutlined />
              </MyLink>
              <div className="text-xl">{appName}</div>
            </div>
          }
          bordered
        >
          <DescriptionItem label="ID" key="id">{appDetail?.id || '/'}</DescriptionItem>
          <DescriptionItem label="AppID" key="app_id">{app_id}</DescriptionItem>
          <DescriptionItem label="版本" key="app_version">{app_version}</DescriptionItem>
          <DescriptionItem label="创建时间" key="created_at">{created_at || '/'}</DescriptionItem>
          <DescriptionItem label="是否解压" key="unzip" span={2}>{unzipped ? '已解压' : '未解压'}</DescriptionItem>
          <DescriptionItem label="文件路径" key="local_path" span={3}>{local_path}</DescriptionItem>
          <DescriptionItem label="运行状态" key="is_running" span={1}>{
            is_running ? <Badge status="processing" text="运行中" /> : <Badge status="processing" text="未运行" />
          }</DescriptionItem>
          <DescriptionItem label="data.json" key="is_running" span={2}>
            <Link to={`/developer/app/data-json/${app_id}`}>查看</Link>
          </DescriptionItem>
          <DescriptionItem label="操作" key="action" span={3}>{
            <Space size={24}>
              {ActionList.map(({ id, value, label, actionStatus }) => (
                <Button key={id}
                  size="small"
                  disabled={isDisableAction
                    || (value === 'unzip' && unzipped)
                    || (value === 'startup' && is_running || startingApp)
                    || (value === 'stop' && !is_running)
                  }
                  type={actionStatus}
                  danger={value === 'delete'}
                  onClick={handleAppAction(value)}>
                  {label}
                </Button>
              ))}
            </Space>
          }</DescriptionItem>
        </Descriptions>
      </div>
      <AppDetailLog>
        <div>操作日志</div>
        <AppDetailLogWrapper>{startLogs}</AppDetailLogWrapper>
      </AppDetailLog>
    </AppDetailContainer>
  );
};
