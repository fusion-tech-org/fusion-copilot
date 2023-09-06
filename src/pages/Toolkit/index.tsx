import { invoke } from '@tauri-apps/api';
import { Button, Form, Input, message } from 'antd';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { FormInstance } from 'antd/es/form';

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

  const handleFinishFailed = (errorInfo: any) => {
    console.log(errorInfo);
  };

  return (
    <div>
      <Form ref={formRef} onFinishFailed={handleFinishFailed}>
        <Form.Item name="title" label="标题">
          <Input placeholder="输入文章标题" />
        </Form.Item>
        <Form.Item name="body" label="正文">
          <Input.TextArea placeholder="输入文章正文" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleFinish}>
            提交
          </Button>
          <Button>取消</Button>
        </Form.Item>
      </Form>
      <Link to="/">返回</Link>
      <Link to="/toolkit/image-handler">图片处理器</Link>
    </div>
  );
};
