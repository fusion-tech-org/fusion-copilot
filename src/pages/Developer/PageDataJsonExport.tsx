import { Alert, Button, Form, Input, Select, Space, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import axios from 'axios';
import { useDeveloperStore } from "store/useDeveloper";
import { useMemo } from "react";

const FormItem = Form.Item;

const targetDirOptions = [
  {
    label: '下载目录',
    value: 'download',
  },
  {
    label: '桌面',
    value: 'desktop',
  },
  {
    label: '应用数据目录',
    value: 'appData',
  },
];

type AvailableDownloadNames = 'download' | 'desktop' | 'appData';

export const PageDataJsonExport = () => {
  const navigate = useNavigate();
  const { envConfigList } = useDeveloperStore();
  const [form] = Form.useForm<{
    baseUrl: string;
    appId: string;
    targetDir: AvailableDownloadNames;
  }>();

  const envOptions = useMemo(() => {
    return envConfigList.map(config => ({
      label: config.env_name,
      value: config.env_value
    }));
  }, [JSON.stringify(envConfigList)])

  const handleConfirm = async () => {
    try {
      const targetDirMap = {
        download: BaseDirectory.Download,
        desktop: BaseDirectory.Desktop,
        appData: BaseDirectory.AppLocalData,
      }
      await form.validateFields();
      const fieldValues = form.getFieldsValue();
      const { baseUrl, appId, targetDir } = fieldValues;

      const resData = await axios.get(`${baseUrl}/api/v1/applications/export/${appId}`);

      await writeTextFile('ziwei_data.json', JSON.stringify(resData.data), {
        dir: targetDirMap[targetDir]
      });

      form.resetFields();

      notification.success({
        message: '应用data.json导出成功',
        description: '',
        placement: 'bottomRight'
      });
    } catch (e) {
      console.error(e);
    }
  }

  return <div className="w-[520px]">
    {envOptions?.length === 0 && <Alert className="mt-3 text-xs" message="当前环境列表为空，请在「开发者」页下「我的设置」中新增环境值" type="info" />}
    <Form form={form} className="mt-6" labelCol={{
      span: 5
    }}>
      <FormItem label="环境" name="baseUrl" rules={[{ required: true, message: '环境参数不能为空' }]}>
        <Select placeholder="请选择环境" options={envOptions} />
      </FormItem>
      <FormItem label="应用ID" name="appId" rules={[{ required: true, message: '应用ID不能为空' }]}>
        <Input placeholder="请输入应用ID" />
      </FormItem>
      <FormItem label="导出至" name="targetDir" initialValue={targetDirOptions[0].value}>
        <Select placeholder="请选择环境" options={targetDirOptions} />
      </FormItem>
      <FormItem className="text-center" >
        <Space size={24}>
          <Button onClick={() => navigate(-1)}>返 回</Button>
          <Button type="primary" className="bg-[var(--theme-primary)]" onClick={handleConfirm}>确 定</Button>
        </Space>
      </FormItem>
    </Form>
  </div>
};