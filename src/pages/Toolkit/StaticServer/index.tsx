import { invoke } from '@tauri-apps/api';
import { Button, Input, InputNumber, message } from 'antd';
import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from 'src/store';

export const StaticServer = () => {
  const [portRange, setPortRange] = useState<String | null>(null);
  const [pendingPort, setPendingPort] = useState<number | null>(null);

  const [isLocalServerRunning, updateLocalServerStatus] = useStore((state) => [
    state.isLocalServerRunning,
    state.updateLocalServerStatus,
  ]);

  const handleStartupLocalServer = async () => {
    const res = await invoke('run_local_server');

    console.log('res', res);
    if (res === true) {
      updateLocalServerStatus(true);
      message.success('本地服务器启动成功');
    }
  };

  const handleChangeValue = (value: any) => {
    console.log(value, typeof value);
    setPendingPort(value);
  };

  const handleCheckPortAvailable = async () => {
    const res = await invoke('check_port_is_available', {
      port: pendingPort,
    });

    console.log(res, 'handleCheckPortAvailable');
  };

  const handleQueryPorts = async () => {
    const res = await invoke('get_available_port_list', {
      portRange: portRange,
    });

    console.log(res, 'res');
  };

  const handleChangePorts = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validPortsRE = /^[1-9]{1}\d{3,4}\.\.\d{4,5}$/i;
    if (!validPortsRE.test(value)) {
      console.log('端口范围格式不准确');
      return;
    }

    setPortRange(value);
  };

  return (
    <div>
      image handler
      <div>
        <Button
          disabled={isLocalServerRunning}
          onClick={handleStartupLocalServer}
        >
          Startup Local Server
        </Button>
      </div>
      <div>
        <Input placeholder="示例: 8000..9000" onChange={handleChangePorts} />
        <Button disabled={!portRange} onClick={handleQueryPorts}>
          查询系统可用端口
        </Button>
      </div>
      <div>
        <InputNumber
          min={1025}
          max={65535}
          defaultValue={8008}
          onChange={handleChangeValue}
        />

        <Button disabled={!pendingPort} onClick={handleCheckPortAvailable}>
          查看一个端口是否可用
        </Button>
      </div>
      <Link to="/">Home</Link>
    </div>
  );
};
