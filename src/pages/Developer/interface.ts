export interface LocalAppItem {
  aid: string;
  version: string;
  name: string;
  localPath: string;
}

export interface RemoteAppItem {
  app_id: string;
  app_name: string;
  app_version: string;
  local_path: string;
  id: number;
  is_running: boolean;
  unzipped: boolean;
  created_at: string;
}
