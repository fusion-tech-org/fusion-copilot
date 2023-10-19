use crate::local_db::establish_connection;
use crate::local_db::models::NewNote;
use diesel::{insert_into, RunQueryDsl};

use fusion_copilot::schema::notes::dsl::*;

#[tauri::command]
pub fn create_note(note_title: &str, note_content: &str) -> usize {
  let new_note = NewNote {
    title: note_title,
    content: note_content,
  };

  let conn = &mut establish_connection();

  insert_into(notes)
    .values(&new_note)
    .execute(conn)
    .expect("Error saving new note")
}
