import { LeftCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exists, BaseDirectory } from '@tauri-apps/api/fs';
import { appLocalDataDir, resolve } from '@tauri-apps/api/path';

const LOWCODE_APP_JAR_NAME = 'lowcode-app';

export const PageDataJson = () => {
  const { aid } = useParams();
  const navigate = useNavigate();

  const [activeDataJson, setActiveDataJson] = useState(null);

  const initDataJson = async () => {
    if (!aid) return;

    const appLocalDataDirPath = await appLocalDataDir();
    // first step: check `lowcode-app.jar` whether unzipped.
    const isLowcodeDirExisted = await exists(`${aid}/${LOWCODE_APP_JAR_NAME}`, {
      dir: BaseDirectory.AppLocalData
    });
    console.log(isLowcodeDirExisted, aid);

    if (isLowcodeDirExisted) {
      const jsonPath = await resolve(appLocalDataDirPath, aid, LOWCODE_APP_JAR_NAME, 'BOOT-INF/classes/data/data.json');
      const dataJson = require(jsonPath);

      setActiveDataJson(dataJson)
    }
  }

  useEffect(() => {
    initDataJson();
  }, []);

  return (
    <div>
      data.json

      <div onClick={() => navigate(-1)}>
        <LeftCircleOutlined />
      </div>

    </div>
  )
};