-- Your SQL goes here
CREATE TABLE ziwei_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  app_name VARCHAR NOT NULL,
  app_id VARCHAR NOT NULL,
  app_version VARCHAR NOT NULL,
  unzipped BOOLEAN NOT NULL DEFAULT false,
  is_running BOOLEAN NOT NULL DEFAULT false
)
