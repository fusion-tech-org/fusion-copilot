import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Input, Layout, MenuProps } from 'antd';
import { NoteListWrapper } from './styles';
import { DeleteOutlined, EditOutlined, LeftCircleOutlined, MoreOutlined, PlusCircleOutlined, PushpinOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import cs from 'classnames';
import { isUndefined } from 'lodash';
import { NoteEditor } from './NoteEditor';

const { Content, Sider } = Layout;

const editorDefaultValue = {
  "type": "doc",
  "content": [
    {
      "type": "text",
      "text": "试试'\\'命令输入..."
    },
  ]
};

const noteOptItems: MenuProps['items'] = [
  {
    key: 'rename',
    label: (
      <div className='flex items-center justify-between text-xs'>
        <span>重命名</span>
        <EditOutlined className='pl-4' />
      </div>
    )
  },
  {
    key: 'fixed',
    label: (
      <div className='flex items-center justify-between text-xs'>
        <span>置顶</span>
        <PushpinOutlined className='pl-4' />
      </div>
    )
  },
  {
    key: 'delete',
    label: (
      <div className='flex items-center justify-between text-xs'>
        <span>删除</span>
        <DeleteOutlined className='pl-4' />
      </div>
    )
  },
];

interface NoteItem {
  id: number;
  title: string
  description?: string
}

const fakeNoteList = new Array(5).fill(0).map((_, i) => ({
  id: i,
  title: `我的备忘录_我的备忘录_我的备忘录_${i}`,
  description: `备忘录描述_备忘录描述_备忘录描述_备忘录描述${i}`
}));

const LOCAL_STORAGE_PREFIX = 'note__content_';

export const NotesPage = () => {
  const navigate = useNavigate();
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [initEditorValue, setInitEditorValue] = useState(editorDefaultValue);

  const handleSelectNote = (note: NoteItem) => () => {
    console.log(note);
    setActiveNote(note);
  };

  useEffect(() => {
    if (isUndefined(activeNote?.id)) return;

    const queryLocalContent = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${activeNote?.id}`);

    if (queryLocalContent) {
      setInitEditorValue
    }

  }, [activeNote?.id]);

  return (
    <Layout className='w-screen h-screen overflow-hidden flex flex-col'>
      <header className='basis-8 flex items-center justify-between bg-white px-4 border-b border-solid'>
        <div className='flex items-center basis-16 cursor-pointer text-[#666] hover:text-[#333]' onClick={() => navigate(-1)}>
          <LeftCircleOutlined />
          <span className='ml-1.5'>返回</span>
        </div>
        <div className='flex items-center justify-center flex-1'>
          {
            activeNote && <span className='text-sm'>{activeNote.title}</span>
          }
        </div>
        <div className='flex items-center justify-center basis-8 cursor-pointer text-[#666] hover:text-[#333]'>
          <SettingOutlined />
        </div>
      </header>
      <Layout className='flex-1'>
        <Sider width={220} style={{
          overflow: 'auto',
          height: 'calc(100vh - 32px)',
          position: 'fixed',
          left: 0,
          top: 32,
          bottom: 0,
        }} className='!bg-[#F6F9F9]' trigger={null}>
          <div className='flex items-center pt-4 px-3'>
            <div>
              <Input className='h-8' placeholder='输入标题关键字...' />
            </div>
            <div className='ml-3 cursor-pointer text-[#666] hover:text-[#333]'>
              <PlusCircleOutlined style={{
                fontSize: 20,
              }} />
            </div>
          </div>
          <NoteListWrapper>
            {
              fakeNoteList.map((note => (
                <div key={note.id} className={cs('flex items-center mt-4 bg-white rounded-xl px-3 py-3 hover:shadow-md duration-300', {
                  'active-note': note.id === activeNote?.id
                })}>
                  <div className='flex-1 select-none cursor-pointer' onClick={handleSelectNote(note)}>
                    <div className='truncate w-[146px]'>{note.title}</div>
                    <div className='mt-2 text-xs text-[#666] truncate w-[146px]'>{note.description}</div>
                  </div>
                  <div className='cursor-pointer'>
                    <Dropdown menu={{ items: noteOptItems }} placement="bottom" arrow trigger={['click']}>
                      <MoreOutlined />
                    </Dropdown>
                  </div>
                </div>
              )))
            }
          </NoteListWrapper>
        </Sider>
        <Content style={{
          marginLeft: 220, backgroundColor: '#fff'
        }}>
          <NoteEditor primaryKey={activeNote?.id} initContent={initEditorValue} />
        </Content>
      </Layout>
    </Layout >
  );
};
