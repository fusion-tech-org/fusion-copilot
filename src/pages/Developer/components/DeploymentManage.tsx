import { FC } from 'react';
import { List, Skeleton, Modal } from 'antd';
import { ExclamationCircleFilled, LockOutlined, RestOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { AppZipListWrapper } from '../styles';
import { RemoteAppItem } from '../interface';
interface DeploymentManageProps {
  onDelete: (appItem: RemoteAppItem) => void;
  availableApps: RemoteAppItem[];
}

const { confirm } = Modal;

export const DeploymentManage: FC<DeploymentManageProps> = (props) => {
  const { onDelete, availableApps } = props;

  const handleDelete = (appItem: RemoteAppItem) => () => {
    confirm({
      title: '请再次确认是否删除该条数据',
      icon: <ExclamationCircleFilled />,
      content: '该操作会清空所有相关的安装包以及文件',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        onDelete?.(appItem);
      },
      onCancel() { },
    });
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
                  className="cursor-pointer hover:text-rose-500 duration-300"
                  onClick={handleDelete(item)}
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
