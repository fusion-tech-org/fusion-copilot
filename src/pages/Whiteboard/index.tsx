import { LeftCircleOutlined } from '@ant-design/icons';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useNavigate } from 'react-router-dom';

export const WhiteboardPage = () => {
  const navigate = useNavigate();

  return <section className="h-screen w-screen overflow-hidden">
    <Excalidraw renderTopRightUI={() => {
      return (
        <div onClick={() => (navigate(-1))}
          className='flex items-center border-[#d6d6d6] border border-solid rounded-lg px-2.5 text-sm cursor-pointer duration-300 hover:bg-[#f5f5f5]'>
          <LeftCircleOutlined className='mr-2' />
          <span>Go Back</span>
        </div>
      )
    }} />
  </section>
};