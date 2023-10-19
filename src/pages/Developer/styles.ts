import styled from 'styled-components';

export const AppZipListWrapper = styled.div`
  height: calc(100vh - 174px);
  padding-right: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;

  &:hover {
    transition: display 0.3s;

    &::-webkit-scrollbar {
      display: block;
    }
    /* .adjust-scrollbar {
      margin-right: -4px;
    } */
  }

  &::-webkit-scrollbar {
    width: 4px;
    display: none;
  }

  &::-webkit-scrollbar-track {
    width: 4px;
    border-radius: 2px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #aaa;
    border-radius: 2px;
    height: 48px;
  }
`;

export const AppDetailContainer = styled.section`
  height: 100vh;
  padding: 16px;
  overflow: hidden;
`;

export const AppDetailLog = styled.div`
  margin-top: 24px;
`;

export const AppDetailLogWrapper = styled.div`
  width: 100%;
  height: 384px;
  margin-top: 16px;
  border: 1px solid #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  overflow: auto;
  background-color: #222;
  color: #fff;
  line-height: 1.8;
`;

export const SettingContainer = styled.div`
  padding: 16px 24px;
`;

export const EnvSettingContainer = styled.div`
  .ant-collapse-header:hover {
    .show-edit {
      display: block;
      transition: all 0.3s;
      color: var(--theme-primary)
    }
  } 
`;
