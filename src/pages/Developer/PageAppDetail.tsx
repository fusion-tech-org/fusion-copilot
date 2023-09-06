import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Descriptions, Space } from 'antd';
import type { DescriptionsProps } from 'antd';

import {
  AppDetailContainer,
  AppDetailLog,
  AppDetailLogWrapper,
} from './styles';
import { LeftCircleOutlined } from '@ant-design/icons';
import { MyLink } from 'components/index';

const items: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'ID',
    children: 'Cloud Database',
  },
  {
    key: '2',
    label: 'AppID',
    children: 'Prepaid',
  },
  {
    key: '3',
    label: '版本',
    children: 'v1.0.0',
  },
  {
    key: '4',
    label: '创建时间',
    children: '2018-04-24 18:00:00',
  },
  {
    key: '5',
    label: '是否已解压',
    children: '是',
    span: 2,
  },
  {
    key: '6',
    label: '运行状态',
    children: <Badge status="processing" text="运行中" />,
    span: 3,
  },
  {
    key: '7',
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
  useEffect(() => {
    console.log('query app detail', id);
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
              <div>急诊分诊信息系统</div>
            </div>
          }
          bordered
          items={items}
        />
      </div>
      <AppDetailLog>
        <div>操作日志</div>
        <AppDetailLogWrapper>sdfsdf</AppDetailLogWrapper>
      </AppDetailLog>
    </AppDetailContainer>
  );
};
