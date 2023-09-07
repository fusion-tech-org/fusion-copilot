import React, { FC, useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton } from 'antd';
import { LockOutlined, RestOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { AppZipListWrapper } from '../styles';
import { RemoteAppItem } from '../interface';
interface DeploymentManageProps {
  onUnZip: (filePath: string) => void;
  onStartup: (appId: string) => void;
  onStop: (appId: string) => void;
  onUpdate: (appId: string) => void;
  onDelete: (appId: string, zipName: string) => void;
  availableApps: RemoteAppItem[];
}

export const DeploymentManage: FC<DeploymentManageProps> = (props) => {
  const { onUnZip, onStartup, onStop, onUpdate, onDelete, availableApps } =
    props;

  const handleUnzip = (filePath: string) => () => {
    onUnZip?.(filePath);
  };

  const handleStartup = (appId: string) => () => {
    onStartup?.(appId);
  };

  const handleStop = (appId: string) => () => {
    onStop?.(appId);
  };

  const handleUpdate = (appId: string) => () => {
    onUpdate?.(appId);
  };

  const handleDelete = (appId: string, zipName: string) => () => {
    onDelete?.(appId, zipName);
  };

  return (
    <AppZipListWrapper>
      <div className="adjust-scrollbar h-full">
        <List
          // loading={initLoading}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={availableApps}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center my-24">
                <div className="text-3xl mb-3">
                  <RestOutlined />
                </div>
                <p className="text-sm">暂无可用应用</p>
              </div>
            ),
          }}
          pagination={{
            align: 'end',
          }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link to={`/developer/app/${item.id}`}>详情</Link>,
                <span key="unzip" onClick={handleUnzip(item.local_path)}>
                  解压
                </span>,
                <span key="start" onClick={handleStartup(item.app_id)}>
                  启动
                </span>,
                <span key="stop" onClick={handleStop(item.app_id)}>
                  停止
                </span>,
                <span key="update" onClick={handleUpdate(item.app_id)}>
                  更新
                </span>,
                <span
                  key="delete"
                  onClick={handleDelete(item.app_id, item.local_path)}
                >
                  删除
                </span>,
              ]}
            >
              <Skeleton avatar title={false} loading={false} active>
                <List.Item.Meta
                  avatar={<LockOutlined style={{ fontSize: 32 }} />}
                  title={<p className="truncate mb-0">{item.app_name}</p>}
                  description={<p className="truncate">{item.local_path}</p>}
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </div>
    </AppZipListWrapper>
  );
};
