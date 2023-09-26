import styled from "styled-components";

export const EditorWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .ProseMirror {
    padding: 1rem 2rem;
  }
`;

export const NoteListWrapper = styled.div`
  margin-top: 4px;
  padding: 0 12px 16px 12px;

  .active-note {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 24px;
      top: 50%;
      left: 0;
      transform: translateY(-12px);
      border-radius: 1px;
      transition: all 0.3s;
      background-color: var(--theme-primary);
    }
  }
`;