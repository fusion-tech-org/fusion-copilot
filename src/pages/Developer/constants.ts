
import type { ActionValue, ActionStatus } from "./interface";

export const ActionList: Readonly<
  Array<{
    label: string;
    value: ActionValue;
    actionStatus: ActionStatus;
    id: number;
  }>
> = [
    // {
    //   id: 1,
    //   label: '解压',
    //   value: 'unzip',
    //   actionStatus: 'primary',
    // },
    // {
    //   id: 2,
    //   label: '启动',
    //   value: 'startup',
    //   actionStatus: 'primary',
    // },
    {
      id: 3,
      label: '关闭应用',
      value: 'stop',
      actionStatus: 'default',
    },
    {
      id: 4,
      label: '删除应用',
      value: 'delete',
      actionStatus: 'default'
    },
  ];

export const OPEN_IP_LIST = [
  'http://localhost',
  "http://127.0.0.1",
];

export const DEFAULT_APP_PORT = 9080;


export const APP_ENV_CONFIG = ['test', 'dev'];