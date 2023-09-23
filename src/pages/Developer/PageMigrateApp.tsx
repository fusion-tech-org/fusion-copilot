import { Select, Input, Space, Button, Form, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { envOptions } from './PageDataJsonExport';

const FormItem = Form.Item;

export const PageMigrateApp = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<{
    sourceBaseUrl: string;
    sourceAppId: string;
    targetBaseUrl: string;
    targetUsername: string;
    targetAppId: string;
  }>();

  const handleConfirm = async () => {
    try {
      await form.validateFields();

      const fieldValues = form.getFieldsValue();
      // const { sourceBaseUrl, sourceAppId, targetBaseUrl, targetUsername, targetAppId } =
      //   fieldValues;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-[480px] mt-6">
      <Form
        form={form}
        labelCol={{
          span: 5,
        }}
      >
        <div className="mb-4 font-semibold">导出应用：</div>
        <FormItem
          label="源环境"
          name="sourceBaseUrl"
          rules={[{ required: true, message: '源环境参数不能为空' }]}
        >
          <Select placeholder="请选择源环境" options={envOptions} />
        </FormItem>
        <FormItem
          label="源应用ID"
          name="sourceAppId"
          rules={[{ required: true, message: '源应用ID不能为空' }]}
        >
          <Input placeholder="请输入源应用ID" />
        </FormItem>
        <Divider />
        <div className="mb-4 font-semibold">目标应用：</div>
        <FormItem
          label="目标环境"
          name="targetBaseUrl"
          rules={[{ required: true, message: '目标环境参数不能为空' }]}
        >
          <Select placeholder="请选择目标环境" options={envOptions} />
        </FormItem>
        <FormItem label="用户名" name="targetUsername">
          <Input placeholder="请输入用户名" />
        </FormItem>
        <FormItem
          label="目标应用ID"
          name="targetAppId"
          rules={[{ required: true, message: '目标应用ID不能为空' }]}
        >
          <Input placeholder="请输入目标应用ID" />
        </FormItem>
        <FormItem className="text-center">
          <Space size={24}>
            <Button onClick={() => navigate(-1)}>返 回</Button>
            <Button type="primary" onClick={handleConfirm}>
              确 定
            </Button>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
};
