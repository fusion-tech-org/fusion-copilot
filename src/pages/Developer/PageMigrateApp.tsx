import { Select, Input, Space, Button, Form, Divider, notification, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import { ZiWeiResponse, checkValidResponseForZiWei } from "utils/index";
import { useDeveloperStore } from "store/useDeveloper";
import { useMemo } from "react";

const FormItem = Form.Item;

export const PageMigrateApp = () => {
  const navigate = useNavigate();
  const { envConfigList } = useDeveloperStore();
  const [form] = Form.useForm<{
    sourceBaseUrl: string;
    sourceAppId: string;
    targetBaseUrl: string;
    targetUsername: string;
    targetAppName: string;
  }>();

  const envOptions = useMemo(() => {
    return envConfigList.map(config => ({
      label: config.env_name,
      value: config.env_value
    }));
  }, [JSON.stringify(envConfigList)])

  const handleConfirm = async () => {
    try {
      await form.validateFields();

      const fieldValues = form.getFieldsValue();
      const {
        sourceBaseUrl,
        sourceAppId,
        targetBaseUrl,
        targetUsername,
        targetAppName,
      } = fieldValues;
      /**
      * NOTE: processing flows
      * 
      * STEP1. fetching source app's data.json
      * 
      * STEP2. On the basis of the data.json to create new app in target environment
      */
      const resData = await axios.get(`${sourceBaseUrl}/api/v1/temps/export/${sourceAppId}`);

      const jsonBlob = new Blob([JSON.stringify(resData.data)], {
        type: 'application/json'
      })
      const tempFile = new File([jsonBlob], 'temp_data_json.json');
      const migrateRes = await axios.post<ZiWeiResponse>(`${targetBaseUrl}/api/v1/temps/import/?username=${targetUsername}&applicationName=${targetAppName}`, {
        file: tempFile
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(checkValidResponseForZiWei(migrateRes.data));
      if (checkValidResponseForZiWei(migrateRes.data)) {
        form.resetFields();
        notification.success({
          message: '应用迁移成功',
          description: '刷新目标平台的应用首页，查看迁移的应用',
          placement: 'bottomRight'
        });
      }
      console.log(migrateRes);
    } catch (e) {
      console.error(e);
      notification.info({
        message: '应用迁移失败',
        description: '请联系管理员查看',
        placement: 'bottomRight'
      })
    }
  };

  return <div className="w-[520px]">
    {envOptions?.length === 0 && <Alert className="mt-3 text-xs" message="当前环境列表为空，请在「开发者」页下「我的设置」中新增环境值" type="info" />}
    <Form form={form} className="mt-6" labelCol={{
      span: 5
    }}>
      <div className="mb-4 font-semibold">导出应用：</div>
      <FormItem label="源环境" name="sourceBaseUrl" rules={[{ required: true, message: '源环境参数不能为空' }]}>
        <Select placeholder="请选择源环境" options={envOptions} />
      </FormItem>
      <FormItem label="源应用ID" name="sourceAppId" rules={[{ required: true, message: '源应用ID不能为空' }]}>
        <Input placeholder="请输入源应用ID" />
      </FormItem>
      <Divider />
      <div className="mb-4 font-semibold">目标应用：</div>
      <FormItem label="目标环境" name="targetBaseUrl" rules={[{ required: true, message: '目标环境参数不能为空' }]}>
        <Select placeholder="请选择目标环境" options={envOptions} />
      </FormItem>
      <FormItem label="用户名" name="targetUsername" rules={[{ required: true, message: '目标应用用户名不能为空' }]}>
        <Input placeholder="请输入用户名" />
      </FormItem>
      <FormItem label="应用名称" name="targetAppName" rules={[{ required: true, message: '目标应用名称不能为空' }]}>
        <Input placeholder="请输入目标应用名称" />
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
