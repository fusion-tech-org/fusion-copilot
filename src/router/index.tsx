import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from 'pages/Home';
import { DeveloperPage } from 'pages/Developer';
import { PageAppDetail } from 'pages/Developer/PageAppDetail';
import { PageDevSetting } from 'pages/Developer/PageDevSetting';
import { ToolKitPage } from 'pages/Toolkit';
import { ImageHandler } from 'pages/Toolkit/ImageHandler';
import { StaticServer } from 'pages/Toolkit/StaticServer';
import { NotesPage } from 'pages/Notes';
import { ImageJSHandler } from 'pages/Toolkit/ImageJSHandler';

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
    path: '/developer',
    element: <DeveloperPage />,
  },
  {
    path: '/developer/global-setting',
    element: <PageDevSetting />,
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
]);
