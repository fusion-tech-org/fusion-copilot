import { useEffect } from 'react';
import { BaseDirectory, createDir, exists } from '@tauri-apps/api/fs';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import { rootRouter } from './router';
import { message } from 'antd';

const APP_DATA_DIR = 'fusion-tech';

function App() {
  const initAppDataDir = async () => {
    const isExisted = await exists(APP_DATA_DIR, {
      dir: BaseDirectory.AppLocalData,
    });

    if (isExisted) return;

    await createDir(APP_DATA_DIR, {
      dir: BaseDirectory.AppLocalData,
      recursive: true,
    });

    message.success('Initial successfully data directory of app');
  };

  useEffect(() => {
    initAppDataDir();
  }, []);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4096ff' } }}>
      {/* <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}> */}
      <RouterProvider router={rootRouter} />
    </ConfigProvider >
  );
}

export default App;
