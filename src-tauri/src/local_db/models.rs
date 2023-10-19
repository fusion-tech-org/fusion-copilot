use diesel::prelude::*;
use diesel::sql_types::Integer;
use diesel::sqlite::Sqlite;
use fusion_copilot::schema::{env_configs, notes, ziwei_apps};
use serde::{Deserialize, Serialize};

/**** ziwei_app start ****/
#[derive(Insertable)]
#[diesel(table_name = ziwei_apps)]
pub struct NewZiWeiApp<'a> {
  pub app_name: &'a str,
  pub app_id: &'a str,
  pub app_version: &'a str,
  pub local_path: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug)]
#[diesel(table_name = ziwei_apps)]
#[diesel(check_for_backend(Sqlite))]
pub struct ZiWeiApp {
  // please note that fields order should consistent with table's fields of the schema
  pub id: i32,
  pub app_name: String,
  pub app_id: String,
  pub app_version: String,
  pub local_path: String,
  pub unzipped: bool,
  pub is_running: bool,
  pub tags: Option<String>,
  pub created_at: String,
}

/**** ziwei_app end ****/

/**** notes start ****/

#[derive(Insertable)]
#[diesel(table_name = notes)]
pub struct NewNote<'a> {
  pub title: &'a str,
  pub content: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = notes)]
pub struct Note {
  pub id: i32,
  pub title: String,
  pub content: String,
  pub note_status: Option<String>,
  pub created_at: Option<String>,
}

/**** notes end ****/

/**** env_configs start ****/
#[derive(Insertable)]
#[diesel(table_name = env_configs)]
pub struct NewEnvConfig<'a> {
  pub env_name: &'a str,
  pub env_value: &'a str,
  pub env_desc: Option<&'a str>,
}

#[derive(Queryable, Selectable, Serialize)]
#[diesel(table_name = env_configs)]
pub struct EnvConfig {
  pub id: i32,
  pub env_name: String,
  pub env_value: String,
  pub env_desc: Option<String>,
  pub created_at: String,
}
/**** env_configs end ****/

/**** users start ****/

/**** users end ****/

/****  ****/

/****  ****/

/****  ****/

/****  ****/
