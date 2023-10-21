import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeftCircleOutlined } from '@ant-design/icons';

import { AppLogContainer } from '../styles';

export const PageAppLog = () => {
  return (
    <AppLogContainer>
      <div className="mb-3 text-center">
        <p className="text-xl mb-3">应用日志详情</p>
        <div className="flex items-center justify-center text-sm">
          <Link
            to="/developer"
            className="flex items-center cursor-pointer text-[#333] no-underline hover:text-primary"
          >
            <LeftCircleOutlined />
            <span className="px-1">·</span>
            <span>返回</span>
          </Link>
        </div>
      </div>
    </AppLogContainer>
  );
};
