import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { BaseDirectory, createDir, exists } from '@tauri-apps/api/fs';
import { RouterProvider } from 'react-router-dom';

import { rootRouter } from './router';
import { message } from 'antd';

const APP_DATA_DIR = 'fusion-tech';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name }));
  }

  const initAppDataDir = async () => {
    // const appLocalDataDirPath = await appLocalDataDir();
    // console.log(appLocalDataDirPath);
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
    <section>
      <RouterProvider router={rootRouter} />
    </section>
  );
}

export default App;
