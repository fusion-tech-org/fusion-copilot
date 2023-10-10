import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Collapse, CollapseProps } from "antd";

import { EnvSettingContainer } from "../styles";

export const EnvSettingsScreen = () => {
  const onChange = (key: string | string[]) => {
    console.log(key);
  };

  const genExtra = () => (
    <div className="hidden show-edit">
      <EditOutlined onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
      }} />
    </div>
  );

  const genContent = (label: string, value: string) => {
    return (
      <div>
        <div>环境值: {value}</div>
        <div>环境说明: {label}</div>
      </div>
    )
  }

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: '测试环境',
      children: genContent('测试', 'http://10.10.31.26:9200'),
      extra: genExtra(),
    },
    {
      key: '2',
      label: '预发环境',
      children: genContent('预发', 'https://staging.fusiontech.cn'),
      extra: genExtra(),
    },
    {
      key: '3',
      label: '正式环境',
      children: genContent('生产', 'https://app.fusiontech.cn'),
      extra: genExtra(),
    },
  ];

  return (
    <EnvSettingContainer>
      <Card bordered={false} extra={<Button type="link" size="small">新增</Button>}>
        <Collapse
          defaultActiveKey={['1']}
          onChange={onChange}
          expandIconPosition="start"
          items={items}
        />
      </Card>
    </EnvSettingContainer>
  )
};