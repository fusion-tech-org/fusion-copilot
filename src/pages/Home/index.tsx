import { Space, Card } from 'antd';
import { BugOutlined, HourglassOutlined, LinkOutlined, ReadOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'components/index';

export const HomePage = () => {
  const navigate = useNavigate();
  const handleLink = (routePath: string) => () => {
    navigate(routePath);
  };

  return (
    <div className="flex flex-col mt-8 items-center h-screen">
      <Icon iconName='logo' svgStyle={{
        width: 72,
        height: 72
      }} />
      <Space className="mx-24 mt-6 justify-start" size={32} wrap>
        <Card style={{ width: 200 }} className="shadow-md shadow-gray-200 hover:shadow-none duration-300">
          <BugOutlined
            style={{
              fontSize: 32,
            }}
          />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/developer')}
          >
            开发者
          </p>
        </Card>
        <Card style={{ width: 200 }} className="shadow-md shadow-gray-200 hover:shadow-none duration-300">
          <ToolOutlined
            style={{
              fontSize: 32,
            }}
          />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/toolkit')}
          >
            工具箱
          </p>
        </Card>
        <Card style={{ width: 200 }} className="shadow-md shadow-gray-200 hover:shadow-none duration-300">
          <ReadOutlined
            style={{
              fontSize: 32,
            }}
          />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/notes')}
          >
            备忘录
          </p>
        </Card>
        <Card style={{ width: 200 }} className="shadow-md shadow-gray-200 hover:shadow-none duration-300">
          <LinkOutlined style={{
            fontSize: 32,
          }} />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/whiteboard')}
          >
            白板
          </p>
        </Card>
        <Card style={{ width: 200 }} className="shadow-md shadow-gray-200 hover:shadow-none duration-300">
          <HourglassOutlined style={{
            fontSize: 32,
          }} />
          <p
            className="text-lg mt-2 cursor-pointer"
            onClick={handleLink('/quadrant-time')}
          >
            任务管理
          </p>
        </Card>
      </Space>
    </div>
  );
};
