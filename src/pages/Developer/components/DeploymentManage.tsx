import React, { FC } from 'react';
import { List, Skeleton } from 'antd';
import { LockOutlined, RestOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { AppZipListWrapper } from '../styles';
import { RemoteAppItem } from '../interface';
interface DeploymentManageProps {
  onDelete: (appId: string, zipName: string) => void;
  availableApps: RemoteAppItem[];
}

export const DeploymentManage: FC<DeploymentManageProps> = (props) => {
  const { onDelete, availableApps } = props;

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
            pageSize: 5,
          }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link to={`/developer/app/${item.id}`}>详情</Link>,
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
