import { invoke } from '@tauri-apps/api';
import { Avatar, Button, Form, Input, List, message } from 'antd';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { FormInstance } from 'antd/es/form';
import { MyLink } from 'components/common-styles';
import { LeftCircleOutlined } from '@ant-design/icons';

type FieldType = {
  title?: string;
  body?: string;
};

export const ToolKitPage = () => {
  const formRef = useRef<FormInstance<FieldType>>(null);
  const handleFinish = async () => {
    const fieldValues = formRef.current?.getFieldsValue();
    if (!fieldValues) return;
    const { title, body } = fieldValues;
    const res = await invoke('create_post', {
      title,
      body,
    });
    console.log(res, 'res');

    if (res === 1) {
      message.success('创建成功');
      formRef.current?.resetFields();
    }
  };

  const data = [
    {
      title: '图片处理器(Rust版)',
      description: '多功能图片处理',
      url: '/toolkit/image-handler',
    },
    {
      title: '图片处理器(WebAssembly版)',
      description: '多功能图片处理',
      url: '/toolkit/image-js-handler',
    },
    {
      title: '静态服务器',
      description: '快速起动一个高性能的静态服务器',
      url: '/toolkit/static-server',
    },

    {
      title: 'SQL查询器',
      description: '本地SQL查询器',
      url: '/toolkit/sql-querier',
    },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center">
        <MyLink to="/" className="pr-4 text-lg font-normal !text-gray-6">
          <LeftCircleOutlined />
        </MyLink>
        <div className="text-xl">工具箱</div>
      </div>
      <div className="mt-4">
        <List
          pagination={{ position: 'bottom', align: 'center' }}
          dataSource={data}
          bordered
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                  />
                }
                title={<Link to={item.url}>{item.title}</Link>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
