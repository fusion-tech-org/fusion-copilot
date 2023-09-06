import { Space, Card } from 'antd';
import { BugOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const ToolManage = () => {
  const navigate = useNavigate();
  const handleLink = (routePath: string) => () => {
    navigate(routePath);
  };

  return (
    <section className="flex justify-center h-screen">
      <Space className="w-3/5 h-3/5" size={32}>
        <Card style={{ width: 200 }}>
          <BugOutlined
            style={{
              fontSize: 32,
            }}
          />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/developer')}
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
            onClick={handleLink('/toolkit')}
          >
            应用迁移
          </p>
        </Card>
      </Space>
    </section>
  );
};
