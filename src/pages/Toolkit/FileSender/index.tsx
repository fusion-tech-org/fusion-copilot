import { useEffect, useState } from 'react';
import { BaseDirectory, readBinaryFile } from '@tauri-apps/api/fs';
import { Button, Modal, Upload } from 'antd';
import { Peer, DataConnection } from 'peerjs';
import { Link } from 'react-router-dom';
import { ReceiverClient } from './ReceiverClient';

export const FileSender = () => {
  const [visible, setVisible] = useState(false);
  // let peer: Peer;
  let conn: DataConnection;
  // let readStream: Read
  const sendFinished = false;

  const example = async () => {
    const contents = await readBinaryFile('sdfsf', {
      dir: BaseDirectory.AppLocalData,
    });

    contents.entries;
  };

  const sendData = (data: string) => {
    const parsedData: {
      msgName: 'chunkReady' | 'readyToReceiveFile';
    } = JSON.parse(data);

    if (parsedData.msgName === 'chunkReady') {
      if (sendFinished) {
        const msg = {
          msgName: 'fileSendFinish',
          sendTime: Date.now(),
        };

        conn.send(JSON.stringify(msg));
      } else {
        console.log('continue send');
      }
    } else if (parsedData.msgName === 'readyToReceiveFile') {
      const msg = {
        msgName: 'sendChunk',
        sendTime: Date.now(),
      };

      conn.send(JSON.stringify(msg));
    }
  };

  const sendFile = () => {
    const sendPeer = new Peer('fileSender', {
      host: '192.168.31.102',
      port: 9418,
      path: '/webrtc',
      debug: 3,
    });

    const conn = sendPeer.connect('fileReceiver');

    conn.on('open', () => {
      const msg = {
        msgName: 'beginSendFile',
        fileName: '',
        sendTime: Date.now(),
      };

      conn.send(JSON.stringify(msg));
    });

    conn.on('data', (data: any) => sendData(data));
  };

  const handleSendFile = () => {
    sendFile();

    setVisible(true);
  };

  useEffect(() => {}, []);
  return (
    <div>
      <div>
        <Upload />
      </div>
      <div>
        <Button onClick={handleSendFile}>send</Button>
        <Link to="/toolkit">Back</Link>
      </div>
      <ReceiverClient />
    </div>
  );
};
