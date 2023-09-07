import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Descriptions, Space } from 'antd';
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

const initDescActionItems: DescriptionsProps['items'] = [
  {
    key: 'action',
    label: '操作',
    children: (
      <Space>
        <div>解压</div>
      </Space>
    ),
  },
];

export const PageAppDetail = () => {
  const { id } = useParams();
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

      const {
        app_id,
        app_name,
        app_version,
        local_path,
        id: primary_key,
        is_running,
        unzipped,
        created_at,
      }: RemoteAppItem = JSON.parse(appStr);
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
