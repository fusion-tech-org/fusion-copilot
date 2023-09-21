import type { ActionValue, ActionStatus } from "./interface";

export const ActionList: Readonly<
  Array<{
    label: string;
    value: ActionValue;
    actionStatus: ActionStatus;
    id: number;
  }>
> = [
    {
      id: 1,
      label: '解压',
      value: 'unzip',
      actionStatus: 'primary',
    },
    {
      id: 2,
      label: '启动',
      value: 'startup',
      actionStatus: 'primary',
    },
    {
      id: 3,
      label: '停止',
      value: 'stop',
      actionStatus: 'default',
    },
    {
      id: 4,
      label: '删除',
      value: 'delete',
      actionStatus: 'default'
    },
  ];