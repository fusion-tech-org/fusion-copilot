import { Tabs, TabsProps } from 'antd';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeftCircleOutlined } from '@ant-design/icons';

import { SettingContainer } from '../styles';
import { EnvSettingsScreen } from './EnvSettings';

const SettingItems: TabsProps['items'] = [
  {
    key: 'envs',
    label: '环境配置',
    children: <EnvSettingsScreen />
  },
  {
    key: 'paths',
    label: '路径配置',
    children: '路径相关配置',
  },
];

export const PageDevSetting = () => {
  return (
    <SettingContainer>
      <div className="mb-3 text-center">
        <p className="text-xl mb-3">开发者配置</p>
        <div className="flex items-center justify-center text-sm">
          <Link
            to="/developer"
            className="flex items-center cursor-pointer text-[#333] no-underline hover:text-primary"
          >
            <LeftCircleOutlined />
            <span className="px-1">·</span>
            <span>返回</span>
          </Link>
          <div className="mx-2 text-slate-300">/</div>
          <div>设置应用相关的参数</div>
        </div>
      </div>
      <Tabs
        tabPosition="left"
        items={SettingItems}
      />
    </SettingContainer>
  );
};
