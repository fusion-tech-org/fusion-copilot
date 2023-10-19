import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Collapse, CollapseProps, Empty, Form, Input, Modal, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api';

import { EnvSettingContainer } from "../styles";
import { SQL_CREATE_SUCCESS } from "constants/index";
import { useDeveloperStore } from 'store/useDeveloper';
import { EnvConfigItem } from "store/interface";

const FormItem = Form.Item;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export const EnvSettingsScreen = () => {
  const [visible, setVisible] = useState(false);
  const [envList, setEnvList] = useState<Record<string, any>[]>([]);
  const { envConfigList, setEnvConfigList } = useDeveloperStore();
  const [form] = Form.useForm<{
    env_name: string;
    env_value: string;
    env_desc?: string;
  }>();

  const onChange = (key: string | string[]) => {
    console.log(key);
  };

  const queryEnvConfigs = async () => {
    try {
      const res: EnvConfigItem[] = await invoke('query_env_configs');

      if (res?.length > 0) {
        setEnvConfigList(res);
      }
    } catch (e) {

    }
  }

  const genExtra = () => (
    <div className="hidden show-edit">
      <EditOutlined onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
      }} />
    </div>
  );

  const genContent = (value: string, label = '') => {
    return (
      <div>
        <div>环境值: {value}</div>
        <div>环境说明: {label}</div>
      </div>
    )
  };

  const handleCancel = useCallback(() => {
    setVisible(false);
    form.resetFields();
  }, [])

  const handleOperateEnv = async () => {
    try {
      await form.validateFields();
      const { env_name, env_value, env_desc } = form.getFieldsValue();

      const res = await invoke('create_env_config', {
        name: env_name,
        value: env_value,
        desc: env_desc
      });

      if (res === SQL_CREATE_SUCCESS) {
        message.success("新增全局环境值成功");
        queryEnvConfigs();

        handleCancel();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const genCollapseItems = () => {
    const items: CollapseProps['items'] = envConfigList.map(item => ({
      key: item.id,
      label: item.env_name,
      children: genContent(item.env_value, item.env_desc),
      extra: genExtra(),
    }));

    setEnvList(items);
  }

  useEffect(() => {
    genCollapseItems();
  }, [JSON.stringify(envConfigList)]);

  return (
    <EnvSettingContainer>
      <Card
        bordered={false} extra={<Button type="link" size="small"
          onClick={() => setVisible(true)}>新增</Button>}>
        {
          envList?.length > 0 ?
            <Collapse
              defaultActiveKey={1}
              onChange={onChange}
              expandIconPosition="start"
              items={envList}
            /> : <div>
              <Empty description="当前环境列表为空，请添加一个环境值" />
            </div>
        }
      </Card>
      <Modal
        open={visible}
        cancelText="取消"
        okText="确认"
        closable={false}
        onCancel={handleCancel}
        onOk={handleOperateEnv}
      >
        <Form
          {...layout}
          form={form}
          className="mt-4"
          style={{ maxWidth: 600 }}
        >
          <FormItem name="env_name" label="名称" rules={[{ required: true, message: "环境名称不能为空" }, {
            max: 50,
            message: '环境名称长度不能超过50个字符'
          }]}>
            <Input />
          </FormItem>
          <FormItem name="env_value" label="环境值" rules={[{ required: true, message: "环境值不能为空" }, {
            max: 50,
            message: '环境名称长度不能超过50个字符'
          }]}>
            <Input />
          </FormItem>
          <FormItem name="env_desc" label="描述" rules={[
            {
              max: 500,
              message: '环境描述长度不能超过500个字符'
            }
          ]}>
            <Input.TextArea rows={3} autoSize={{
              maxRows: 4,
              minRows: 2
            }} />
          </FormItem>
        </Form>
      </Modal>
    </EnvSettingContainer>
  )
};