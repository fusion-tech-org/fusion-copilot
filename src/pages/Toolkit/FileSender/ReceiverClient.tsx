import { Button } from 'antd';
import { Peer, DataConnection } from 'peerjs';
import { useEffect } from 'react';

export const ReceiverClient = () => {
  let connRef: DataConnection;
  const initPeer = () => {
    const peer = new Peer('fileReceiver', {
      host: '192.168.31.102',
      port: 9418,
      path: '/webrtc',
      debug: 3
    });


    peer.on('connection', (conn) => {
      connRef = conn;

      conn.on('data', async (data: any) => {
        const parsedData: {
          msgName: 'beginSendFile' | 'fileSendFileFinish' | 'sendChunk'
        } = JSON.parse(data);

        if (parsedData.msgName === 'beginSendFile') {
          console.log('received send file request <-');

        } else if (parsedData.msgName === 'fileSendFileFinish') {
          console.log('sending file finished');
        } else if (parsedData.msgName === 'sendChunk') {
          console.log('received file chunk <-');

          const msg = {
            msgName: 'chunkReady',
            sendTime: Date.now()
          };

          conn.send(JSON.stringify(msg));
        }
      })
    })
  };

  const handleConfirmReceive = () => {
    if (!connRef) return;

    const msg = {
      msgName: 'readyToReceiveFile',
      sendTime: Date.now()
    };

    connRef.send(JSON.stringify(msg))
  }

  useEffect(() => {
    initPeer();
  }, []);

  return (
    <div>
      <Button onClick={handleConfirmReceive}>Confirm</Button>
    </div>
  )
};