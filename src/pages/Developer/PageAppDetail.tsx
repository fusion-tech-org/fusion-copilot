import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Descriptions, Space, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { LeftCircleOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api';

import {
  AppDetailContainer,
  AppDetailLog,
  AppDetailLogWrapper,
} from './styles';
import { MyLink } from 'components/index';
import { RemoteAppItem } from './interface';
import { toNumber } from 'lodash';
import {
  appLocalDataDir,
  resolve,
  resolveResource,
} from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';

const initDescItems: DescriptionsProps['items'] = [
  {
    key: 'id',
    label: 'ID',
    children: '/',
  },
  {
    key: 'app_id',
    label: 'AppID',
    children: '/',
  },
  {
    key: 'app_version',
    label: '版本',
    children: '/',
  },
  {
    key: 'created_at',
    label: '创建时间',
    children: '/',
  },
  {
    key: 'unzipped',
    label: '是否解压',
    children: '/',
    span: 2,
  },
  {
    key: 'local_path',
    label: '文件路径',
    children: '/',
    span: 3,
  },
  {
    key: 'is_running',
    label: '运行状态',
    children: <Badge status="processing" text="未运行" />,
    span: 3,
  },
];

type ActionValue = 'unzip' | 'startup' | 'stop' | 'update' | 'delete';

type ActionStatus = 'default' | 'warn' | 'primary' | 'danger';

const ActionList: Readonly<
  Array<{
    label: string;
    value: ActionValue;
    actionStatus?: ActionStatus;
    id: number;
  }>
> = [
  {
    id: 1,
    label: '解压',
    value: 'unzip',
  },
  {
    id: 2,
    label: '启动',
    value: 'startup',
  },
  {
    id: 3,
    label: '停止',
    value: 'stop',
  },
  {
    id: 4,
    label: '更新',
    value: 'update',
  },
  {
    id: 5,
    label: '删除',
    value: 'delete',
  },
];

export const PageAppDetail = () => {
  const { id } = useParams();
  const appDetailRef = useRef<RemoteAppItem | null>(null);

  const handleUnzipPackage = async (sourceFile: string) => {
    const targetDir = await appLocalDataDir();
    const msg: string = await invoke('unzip_file', {
      sourceFile: sourceFile,
      targetDir,
    });

    console.log(msg);

    message.info(msg);
  };

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

  const ACTION_MAP_INVOKE: Record<
    ActionValue,
    {
      name?: string;
      params?: string[];
      func?: (params: any) => void;
    }
  > = {
    unzip: {
      func: handleUnzipPackage,
    },
    startup: {
      func: handleStartApp,
    },
    stop: {
      func: handleStopApp,
    },
    update: {
      name: 'toggle_app_running_status',
      params: ['appKey', 'appRunningStatus'],
    },
    delete: {
      name: 'del_app_by_id',
      params: ['appKey'],
    },
  };

  const handleAppAction = (action: ActionValue) => async () => {
    const { func, params, name } = ACTION_MAP_INVOKE[action];

    if (func) func?.(params);

    if (name) {
      const res = await invoke(name);

      console.log(res);
    }
  };

  const initDescActionItems: DescriptionsProps['items'] = [
    {
      key: 'action',
      label: '操作',
      children: (
        <Space size={24}>
          {ActionList.map(({ id, value, label, actionStatus }) => (
            <Button key={id} size="small" onClick={handleAppAction(value)}>
              {label}
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  const [descItems, setDescItems] = useState([
    ...initDescItems,
    ...initDescActionItems,
  ]);
  const [appName, setAppName] = useState('未命名应用');

  const initAppDetail = async () => {
    try {
      const appStr: string = await invoke('get_app_by_id', {
        appKey: toNumber(id),
      });
      const parsedAppDetail = JSON.parse(appStr);

      const {
        app_id,
        app_name,
        app_version,
        local_path,
        id: primary_key,
        is_running,
        unzipped,
        created_at,
      }: RemoteAppItem = parsedAppDetail;
      appDetailRef.current = parsedAppDetail;
      const pendingDescItems = [
        {
          key: 'id',
          label: 'ID',
          children: primary_key,
        },
        {
          key: 'app_id',
          label: 'AppID',
          children: app_id,
        },
        {
          key: 'app_version',
          label: '版本',
          children: app_version,
        },
        {
          key: 'created_at',
          label: '创建时间',
          children: created_at,
        },
        {
          key: 'unzipped',
          label: '是否解压',
          children: unzipped ? '已解压' : '未解压',
          span: 2,
        },
        {
          key: 'local_path',
          label: '文件路径',
          children: local_path,
          span: 3,
        },
        {
          key: 'is_running',
          label: '运行状态',
          children: is_running ? (
            <Badge status="processing" text="运行中" />
          ) : (
            <Badge status="default" text="未运行" />
          ),
          span: 3,
        },
      ];
      setAppName(app_name);
      setDescItems([...pendingDescItems, ...initDescActionItems]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    initAppDetail();
  }, []);

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
          items={descItems}
        />
      </div>
      <AppDetailLog>
        <div>操作日志</div>
        <AppDetailLogWrapper></AppDetailLogWrapper>
      </AppDetailLog>
    </AppDetailContainer>
  );
};
