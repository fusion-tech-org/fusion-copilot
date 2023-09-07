use crate::local_db::establish_connection;
use crate::local_db::models::{NewNote, NewZiWeiApp, ZiWeiApp};
use diesel::{insert_into, ExpressionMethods, QueryDsl, RunQueryDsl};

use FusionTech::schema::ziwei_apps::dsl::*;

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),
}

// we must manually implement serde::Serialize
impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
}

#[tauri::command]
pub fn create_ziwei_app(
  name: &str,
  new_app_id: &str,
  version: &str,
  local_app_path: &str,
) -> usize {
  let new_app = NewZiWeiApp {
    app_name: name,
    app_id: new_app_id,
    app_version: version,
    local_path: local_app_path,
  };

  let conn = &mut establish_connection();

  insert_into(ziwei_apps)
    .values(&new_app)
    .execute(conn)
    .expect("Error saving new app")
}

#[tauri::command]
pub fn query_ziwei_apps() -> Result<Vec<ZiWeiApp>, Error> {
  let conn = &mut establish_connection();

  let results = ziwei_apps
    .limit(10)
    // .load_iter(conn)
    .load::<ZiWeiApp>(conn)
    .expect("Error loading ziwei apps");

  Ok(results)
}

#[tauri::command]
pub fn get_app_by_id(app_key: i32) -> String {
  let conn = &mut establish_connection();

  let queried_app = ziwei_apps
    .filter(id.eq(&app_key))
    .first::<ZiWeiApp>(conn)
    .expect("The ziwei app not found");

  serde_json::to_string(&queried_app).unwrap()
}

#[tauri::command]
pub fn del_app_by_id(app_key: i32) -> usize {
  let conn = &mut establish_connection();

  diesel::delete(ziwei_apps.filter(id.eq(&app_key)))
    .execute(conn)
    .expect("Error deleting ziwei app")
}

#[tauri::command]
pub fn toggle_app_running_status(app_key: i32, app_running_status: bool) -> usize {
  let conn = &mut establish_connection();

  diesel::update(ziwei_apps.find(app_key))
    .set(is_running.eq(app_running_status))
    .execute(conn)
    .expect("Can not find the app")
}

// #[tauri::command]
// pub fn create_note(note_title: &str, note_content: &str) -> usize {
//   let new_note = NewNote {
//     title: note_title,
//     content: note_content,
//   };
//   let conn = &mut establish_connection();

//   insert_into(notes)
//     .values(&new_note)
//     .execute(conn)
//     .expect("Error saving new note")
// }

// #[tauri::command]
// pub fn calculate(method: &str, state: State<Counter>) -> i32 {
//   let mut counter = state.count.lock().unwrap();

//   match method {
//     "add" => {
//       *counter = *counter + 1;
//     }
//     "subtract" => {
//       *counter = *counter + 1;
//     }
//     _ => (),
//   }

//   *counter
// }
