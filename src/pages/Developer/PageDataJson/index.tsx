import { LeftCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exists, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { appLocalDataDir, resolve } from '@tauri-apps/api/path';
// import { useInternal } from 'store/useInternal';
import { Graph } from './components/Graph';
import { SEP } from 'constants/index'

const LOWCODE_APP_JAR_NAME = 'lowcode-app';

export const PageDataJson = () => {
  const { aid } = useParams();
  const navigate = useNavigate();
  const [pendingDataJson, setPendingDataJson] = useState('');

  // const [setGraph] = useInternal(state => ([state.setGraph]))

  const initDataJson = async () => {
    if (!aid) return;

    const appLocalDataDirPath = await appLocalDataDir();
    // first step: check `lowcode-app.jar` whether unzipped.
    const isLowcodeDirExisted = await exists(`${aid}${SEP}${LOWCODE_APP_JAR_NAME}`, {
      dir: BaseDirectory.AppLocalData
    });
    console.log(isLowcodeDirExisted, aid);

    if (isLowcodeDirExisted) {
      const jsonPath = await resolve(appLocalDataDirPath, aid, LOWCODE_APP_JAR_NAME, `BOOT-INF${SEP}classes${SEP}data${SEP}data.json`);
      console.log(jsonPath);
      const dataJson = await readTextFile(`${aid}${SEP}${LOWCODE_APP_JAR_NAME}${SEP}BOOT-INF${SEP}classes${SEP}data${SEP}data.json`, {
        dir: BaseDirectory.AppLocalData
      });

      setPendingDataJson(dataJson);
      // setGraph(dataJson);
    }
  }

  useEffect(() => {
    initDataJson();
  }, []);

  return (
    <div className='w-screen h-screen relative overflow-hidden'>
      <header className="w-full absolute top-0 z-[1]">
        <div className='flex h-10 w-full px-4 items-center bg-white/[.05]'>
          <div onClick={() => navigate(-1)} className="text-slate-200">
            <LeftCircleOutlined />
          </div>
        </div>
      </header>
      <Graph json={pendingDataJson} className='w-full h-full' />
    </div>
  )
};