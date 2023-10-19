use crate::local_db::establish_connection;
use crate::local_db::models::{EnvConfig, NewEnvConfig};
use diesel::{insert_into, RunQueryDsl, SelectableHelper};

use fusion_copilot::schema::env_configs::dsl::*;

#[tauri::command]
pub fn create_env_config(name: &str, value: &str, desc: Option<&str>) -> usize {
  let new_env = NewEnvConfig {
    env_name: name,
    env_value: value,
    env_desc: desc,
  };

  let conn = &mut establish_connection();

  insert_into(env_configs)
    .values(&new_env)
    .execute(conn)
    .expect("Error saving new env")
}

#[tauri::command]
pub fn query_env_configs() -> Result<Vec<EnvConfig>, super::Error> {
  let conn = &mut establish_connection();

  let result = env_configs
    .load::<EnvConfig>(conn)
    .expect("Error loading env configs");

  Ok(result)
}
