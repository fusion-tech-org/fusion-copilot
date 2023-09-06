import React, { FC, useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { PackageList } from '..';
import { AppZipListWrapper } from '../styles';
import { Link } from 'react-router-dom';

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

interface DeploymentManageProps {
  onUnZip: (filePath: string) => void;
  onStartup: (appId: string) => void;
  onStop: (appId: string) => void;
  onUpdate: (appId: string) => void;
  onDetail: (appId: string) => void;
  onDelete: (appId: string, zipName: string) => void;
  packageList: PackageList[];
}

export const DeploymentManage: FC<DeploymentManageProps> = (props) => {
  const {
    onUnZip,
    onStartup,
    onStop,
    onUpdate,
    onDelete,
    onDetail,
    packageList,
  } = props;
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PackageList[]>([]);
  const [list, setList] = useState<PackageList[]>([]);

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

  const handleDetail = (appId: string) => () => {
    onDetail?.(appId);
  };

  const handleDelete = (appId: string, zipName: string) => () => {
    onDelete?.(appId, zipName);
  };

  useEffect(() => {
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((res) => {
        setInitLoading(false);
        setData(res.results);
        setList(res.results);
      });
  }, []);

  return (
    <AppZipListWrapper>
      <div className="adjust-scrollbar">
        <List
          // loading={initLoading}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={packageList}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link to={`/developer/app/${item.id}`}>详情</Link>,
                <span key="unzip" onClick={handleUnzip(item.path)}>
                  解压
                </span>,
                <span key="start" onClick={handleStartup(item.id)}>
                  启动
                </span>,
                <span key="stop" onClick={handleStop(item.id)}>
                  停止
                </span>,
                <span key="update" onClick={handleUpdate(item.id)}>
                  更新
                </span>,
                <span key="delete" onClick={handleDelete(item.id, item.name)}>
                  删除
                </span>,
              ]}
            >
              <Skeleton avatar title={false} loading={false} active>
                <List.Item.Meta
                  avatar={<LockOutlined style={{ fontSize: 32 }} />}
                  title={<p className="truncate mb-0">{item.name}</p>}
                  description={<p className="truncate">{item.path}</p>}
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </div>
    </AppZipListWrapper>
  );
};
