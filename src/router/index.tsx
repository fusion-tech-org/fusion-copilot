import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from 'pages/Home';
import { DeveloperPage } from 'pages/Developer';
import { PageAppDetail } from 'pages/Developer/PageAppDetail';
import { PageDevSetting } from 'pages/Developer/PageDevSetting';
import { ToolKitPage } from 'pages/Toolkit';
import { ImageHandler } from 'pages/Toolkit/ImageHandler';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
]);
