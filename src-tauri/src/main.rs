#![allow(unused)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use front_commands::action_opts::{
  create_ziwei_app, del_app_by_id, get_app_by_id, query_ziwei_apps, toggle_app_running_status,
};
use front_commands::file_opts::{get_resource_file, greet, unzip_file};
use front_commands::sys_opts::{
  check_port_is_available, get_available_port_list, run_local_server,
};

use std::sync::Mutex;

mod front_commands;

mod server;

mod local_db;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//   format!("Hello, {}! You've been greeted from Rust!", name)
// }

pub struct Counter {
  count: Mutex<i32>,
}

fn main() {
  // create a new Tauri application builder with default settings
  tauri::Builder::default()
    .setup(|app| {
      // initialize the database
      local_db::init();

      Ok(())
    })
    .manage(Counter {
      count: Mutex::new(0),
    })
    .invoke_handler(tauri::generate_handler![
      greet,
      unzip_file,
      get_resource_file,
      create_ziwei_app,
      run_local_server,
      get_available_port_list,
      check_port_is_available,
      query_ziwei_apps,
      toggle_app_running_status,
      get_app_by_id,
      del_app_by_id
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
