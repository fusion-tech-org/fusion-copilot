import { FC } from "react";
import { Editor } from 'novel';

import { EditorWrapper } from "./styles";
import { isNull, isUndefined } from "lodash";
import { Result } from "antd";
import { HourglassOutlined } from "@ant-design/icons";

type JSONContent = {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};

interface NodeEditorProps {
  primaryKey?: string | number;
  initContent?: JSONContent | string;
}

// const editorDefaultValue = {
//   "type": "doc",
//   "content": [
//     {
//       "type": "text",
//       "text": "试试'\\'命令输入..."
//     },
//   ]
// };


const LOCAL_STORAGE_PREFIX = 'note__content_';

export const NoteEditor: FC<NodeEditorProps> = (props) => {
  const { primaryKey, initContent } = props;

  const handleDebouncedUpdate = (editor: any) => {
    console.log(editor);
  };

  const handleChangeEditable = () => {
    return true;
  };


  return (
    <EditorWrapper>
      {
        isUndefined(primaryKey) || isNull(primaryKey) ? (
          <div className="flex items-center justify-center mt-16">
            <Result icon={<HourglassOutlined style={{ fontSize: 48 }} />}
              title="那么，从选择一篇笔记开始吧..." />
          </div>
        ) : <Editor className="shodow-none" editorProps={{
          editable: handleChangeEditable
        }}
          onDebouncedUpdate={handleDebouncedUpdate}
          defaultValue={initContent}
          storageKey={`${LOCAL_STORAGE_PREFIX}${primaryKey}`} />
      }

    </EditorWrapper>
  );
};