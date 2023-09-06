use diesel::prelude::*;
use diesel::sql_types::Integer;
use serde::{Deserialize, Serialize};
use FusionTech::schema::{notes, ziwei_apps};

#[derive(Insertable)]
#[diesel(table_name = ziwei_apps)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct NewZiWeiApp<'a> {
  pub app_name: &'a str,
  pub app_id: &'a str,
  pub app_version: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = ziwei_apps)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
#[derive(Debug, Serialize, Deserialize)]
pub struct ZiWeiApp {
  pub id: i32,
  pub app_name: String,
  pub app_id: String,
  pub app_version: String,
  pub unzipped: bool,
  pub is_running: bool,
}

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
  pub note_status: String,
  pub created_at: String,
}
