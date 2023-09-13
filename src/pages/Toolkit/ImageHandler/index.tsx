import { invoke } from '@tauri-apps/api';
import { getClient, Body, ResponseType } from '@tauri-apps/api/http';
import { Button, Input } from 'antd';
import { ChangeEvent, useState } from 'react';

import { Link } from 'react-router-dom';
import { useStore } from 'src/store';

export const ImageHandler = () => {
  const [urlValue, setUrlValue] = useState<string | null>(null);
  const isLocalServerRunning = useStore((state) => state.isLocalServerRunning);

  const handleChangeUrl = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setUrlValue(value);
  };

  const handleGetRequest = async () => {
    try {
      // const res = await fetch(
      //   'http://localhost:4875/image/CgoKCAjYBBCgBiADCgY6BAgUEBQKBDICCAM/https%3A%2F%2Fimages%2Epexels%2Ecom%2Fphotos%2F2470905%2Fpexels%2Dphoto%2D2470905%2Ejpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260',
      //   {
      //     method: 'GET',
      //     timeout: 30,
      //   }
      // );
      console.log('handleGetRequest');
      const client = await getClient();
      const response = await client.post<{
        spec: string;
        url: string;
      }>(
        'http://127.0.0.1:4875/image',
        Body.json({
          spec: 'CgoKCAjYBBCgBiADCgY6BAgUEBQKBDICCAM',
          url: 'https://images.pexels.com/photos/2470905/pexels-photo-2470905.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        }),
        // in this case the server returns a simple string
        {
          timeout: 30,
          responseType: ResponseType.Text,
        }
      );
      // const res = await fetch('http://127.0.0.1:4875/image', {
      //   method: 'post',
      //   timeout: 30,
      // });

      console.log(typeof response.data);
    } catch (e) {}
  };

  return (
    <div>
      <div>
        <Input placeholder="输入你的url" onChange={handleChangeUrl} />

        <div>
          <Button onClick={handleGetRequest}>Get</Button>
        </div>
      </div>
      <Link to="/toolkit">Back</Link>
    </div>
  );
};
