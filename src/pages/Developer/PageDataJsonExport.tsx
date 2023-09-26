import { Button, Form, Input, Select, Space, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs";
import axios from 'axios';

const FormItem = Form.Item;

export const envOptions = [
  {
    label: '测试',
    value: 'http://10.10.31.26:9200',
  },
  {
    label: '预发',
    value: 'https://staging.fusiontech.cn',
  },
  {
    label: '正式',
    value: 'https://app.fusiontech.cn',
  }
];

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
  const [form] = Form.useForm<{
    baseUrl: string;
    appId: string;
    targetDir: AvailableDownloadNames;
  }>();

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

  return <div className="w-[360px] mt-12">
    <Form form={form} labelCol={{
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
          <Button type="primary" onClick={handleConfirm}>确 定</Button>
        </Space>
      </FormItem>
    </Form>
  </div>
};