import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Checkbox, Descriptions, Divider, Form, Space, message } from 'antd';
import { GlobalOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/shell';
import { divide, isArray, isEmpty, isString, map, toNumber, uniq } from 'lodash';
import {
  appLocalDataDir,
  resolve,
} from '@tauri-apps/api/path';
// import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
import { Command } from '@tauri-apps/api/shell';

import {
  AppDetailContainer,
} from './styles';
import { MyLink } from 'components/index';
import { ActionValue, RemoteAppItem } from './interface';
import { ActionList, OPEN_IP_LIST, DEFAULT_APP_PORT } from './constants';
import { stopApp } from 'utils/index';
import { SQL_CREATE_SUCCESS } from 'constants/index';

const DescriptionItem = Descriptions.Item;
const FormItem = Form.Item;

export const PageAppDetail = () => {
  const { id } = useParams();
  const [appDetail, setAppDetail] = useState<RemoteAppItem | null>(null);
  const [form] = Form.useForm<{
    auth?: boolean;
    reloadJSON?: boolean;
    warpSQL?: boolean;
    useTest?: boolean;
  }>();
  const appKey = toNumber(id);
  const [startingApp, setStartingApp] = useState(false);
  const [enableAuth, setEnableAuth] = useState(false);
  const [appPort, setAppPort] = useState(DEFAULT_APP_PORT);
  const [appUrls, setAppUrls] = useState<string[]>([]);
  // const [startLogs, setStartLogs] = useState('');

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

    if (res === SQL_CREATE_SUCCESS) {
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

  // const recordAndPersistLogs = (data: string) => {
  //   setStartLogs((prevLog => prevLog + data))
  // };

  const checkPortValid = async () => {
    let isValidPort = true;
    let pendingPort = DEFAULT_APP_PORT;

    while (isValidPort) {
      const validPort = await invoke('check_port_is_available', {
        port: pendingPort
      });

      if (validPort) {
        isValidPort = false;
        setAppPort(pendingPort);
        return;
      }

      pendingPort += 1
    }
  }

  const getLocalIPAddr = async () => {
    try {
      const localIp: string = await invoke('query_local_ip');

      if (!!localIp) return localIp;

    } catch (e) {
      console.log(e);
    }
  };

  const genOpenUrls = async () => {
    const getLocalIp = await getLocalIPAddr();
    const availableAddr = OPEN_IP_LIST;

    if (getLocalIp) {
      availableAddr.push(`http://${getLocalIp}`);
    }

    const uniqueAndFormatUrl = map(uniq(availableAddr), (url) => `${url}:${appPort}`)

    setAppUrls(uniqueAndFormatUrl)
  }

  const handleStartApp = async (appId: string) => {
    try {
      setStartingApp(true);
      await checkPortValid();
      await genOpenUrls();
      const targetDir = await appLocalDataDir();
      const pendingAppPath = await resolve(targetDir, appId, 'lowcode-app.jar');
      // const logPath = await resolve(targetDir, appId, 'appLog');
      const {
        auth,
        reloadJSON,
        warpSQL,
        useTest
      } = form.getFieldsValue();
      const cmdParams = [
        '-jar',
        pendingAppPath,
      ];

      if (!auth) {
        cmdParams.push('--filter.enable=false');
      }

      cmdParams.push(`--server.port=${appPort}`);

      if (useTest) {
        cmdParams.push('--spring.profiles.active=test');
      } else {
        cmdParams.push('--spring.profiles.active=dev');
      }

      if (reloadJSON) {
        cmdParams.push('--file.extend.path.enable=true')
      }

      if (warpSQL) {
        cmdParams.push('--sql.wrap=true')
      }

      console.log('cmdParams', cmdParams);

      const cmd = new Command('run-start-app', cmdParams);

      cmd.on('close', (data) => {
        console.log(
          `command finished with code ${data.code} and signal ${data.signal}`
        );
        setStartingApp(false);
      });
      cmd.stdout.once('data', () => {
        handleToggleAppRunStatus(true);
      })

      // cmd.stdout.on('data', data => {
      //   recordAndPersistLogs(data);
      // }
      // );

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

  const handleOpenUrl = (url: string) => async () => {
    console.log(url);
    await open(url);
  }

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
          <DescriptionItem label="应用状态" key="is_running" span={3}>{
            is_running ? <Badge status="processing" text="运行中" /> : <Badge status="processing" text="未运行" />
          }</DescriptionItem>
          <DescriptionItem label="data.json" key="is_running" span={1}>
            <Link to={`/developer/app/data-json/${app_id}`}>查看与搜索</Link>
          </DescriptionItem>
          <DescriptionItem label="日志" key="app_log" span={1}>
            <Link to={`/developer/app/log/${app_id}`}>查看</Link>
          </DescriptionItem>
          <DescriptionItem label="脚本" key="app_script" span={1}>
            <Link to={`/developer/app/script/${app_id}`}>编辑</Link>
          </DescriptionItem>
          <DescriptionItem label="解压操作" key="unzip-action" span={3}>
            <Button key="unzip"
              size="small"
              disabled={isDisableAction || unzipped
              }
              type="primary"
              onClick={handleAppAction('unzip')}>
              解压
            </Button>
          </DescriptionItem>
          <DescriptionItem label="启动操作" key="startup-action" span={3}>
            <div className="flex items-center">
              <Button key="startup"
                size="small"
                disabled={isDisableAction || is_running || startingApp || !unzipped
                }
                type="primary"
                className="mr-12"
                onClick={handleAppAction('startup')}>
                启动
              </Button>
              <Form form={form} layout="inline" size="small">
                <FormItem name="auth">
                  <Checkbox>是否扫码</Checkbox>
                </FormItem>
                <FormItem name="reloadJSON">
                  <Checkbox>重载Data.json</Checkbox>
                </FormItem>
                <FormItem name="warpSQL">
                  <Checkbox>包装SQL</Checkbox>
                </FormItem>
                <FormItem name="useTest">
                  <Checkbox>使用测试环境</Checkbox>
                </FormItem>
              </Form>

            </div>
          </DescriptionItem>
          {
            is_running && <DescriptionItem label="使用浏览器打开" key="startup-action" span={3}>
              <Space>
                {
                  appUrls.map((openUrl, index) => (
                    <>
                      <div onClick={handleOpenUrl(openUrl)} className="flex items-center text-xs cursor-pointer hover:text-[var(--theme-primary)]">
                        {openUrl}
                        <GlobalOutlined className="ml-1" />
                      </div>
                      {
                        index < appUrls.length - 1 && <Divider type="vertical" />
                      }
                    </>
                  )
                  )
                }
              </Space>
            </DescriptionItem>
          }
          <DescriptionItem label="更新操作" key="startup-action" span={3}>
            <Space size={24}>
              <Button type="default" size="small">更新Data.json</Button>
              <Divider type="vertical" />
              <Button type="default" size="small">更新客户端</Button>
              <Divider type="vertical" />
              <Button type="default" size="small">更新服务端</Button>
            </Space>
          </DescriptionItem>
          <DescriptionItem label="其它操作" key="action" span={3}>{
            <Space size={24}>
              {ActionList.map(({ id, value, label, actionStatus }) => (
                <Button key={id}
                  size="small"
                  disabled={isDisableAction
                    || (value === 'unzip' && unzipped)
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
    </AppDetailContainer>
  );
};
