import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const PageDevSetting = () => {
  useEffect(() => {
    console.log('query app detail');
  }, []);
  return (
    <div>
      PageDevSetting
      <Link to="/developer">go back</Link>
    </div>
  );
};
