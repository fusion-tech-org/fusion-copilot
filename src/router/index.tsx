import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from 'pages/Home';
import { DeveloperPage } from 'pages/Developer';
import { PageAppDetail } from 'pages/Developer/PageAppDetail';
import { PageDataJson } from 'pages/Developer/PageDataJson';
import { PageDevSetting } from 'pages/Developer/PageDevSetting/index';
import {
  ToolKitPage,
  ImageHandler,
  StaticServer,
  FileSender,
  ImageJSHandler,
} from 'pages/Toolkit';
import { NotesPage } from 'pages/Notes';
import { WhiteboardPage } from 'pages/Whiteboard';
import { PageDataJsonExport } from 'pages/Developer/PageDataJsonExport';
import { PageToolManage } from 'pages/Developer/PageToolManage';
import { PageMigrateApp } from 'pages/Developer/PageMigrateApp';
import { QuadrantTime } from 'pages/QuadrantTime';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/notes',
    element: <NotesPage />,
  },
  {
    path: '/whiteboard',
    element: <WhiteboardPage />,
  },
  {
    path: '/developer',
    element: <DeveloperPage />,
    children: [
      {
        path: '/developer',
        element: <PageToolManage />,
        index: true,
      },
      {
        path: '/developer/export-json',
        element: <PageDataJsonExport />
      },
      {
        path: '/developer/migrate-app',
        element: <PageMigrateApp />
      },
    ]
  },
  {
    path: '/developer/global-setting',
    element: <PageDevSetting />,
  },
  {
    path: '/developer/app/data-json/:aid',
    element: <PageDataJson />,
  },
  {
    path: '/developer/app/:id',
    element: <PageAppDetail />,
  },
  {
    path: '/toolkit',
    element: <ToolKitPage />,
  },
  { path: '/toolkit/image-handler', element: <ImageHandler /> },
  { path: '/toolkit/image-js-handler', element: <ImageJSHandler /> },
  { path: '/toolkit/static-server', element: <StaticServer /> },
  { path: '/toolkit/file-sender', element: <FileSender /> },
  {
    path: '/quadrant-time', element: <QuadrantTime />
  }
]);
