import { useNavigate } from 'react-router-dom';
import { Space, Card } from 'antd';
import { BugOutlined, ToolOutlined } from '@ant-design/icons';

export const PageToolManage = () => {
  const navigate = useNavigate();
  const handleLink = (routePath: string) => () => {
    navigate(routePath);
  };
  return <div className="w-full h-full">
    <Space className="w-3/5 h-3/5" size={32}>
      <Card style={{ width: 200 }}>
        <BugOutlined
          style={{
            fontSize: 32,
          }}
        />
        <p
          className="text-lg mt-2 cursor-pointer"
          onClick={handleLink('/developer/export-json')}
        >
          导出应用DataJson
        </p>
      </Card>
      <Card style={{ width: 200 }}>
        <ToolOutlined
          style={{
            fontSize: 32,
          }}
        />
        <p
          className="text-lg mt-2 cursor-pointer"
          onClick={handleLink('/developer/migrate-app')}
        >
          应用迁移
        </p>
      </Card>
    </Space>
  </div>
};