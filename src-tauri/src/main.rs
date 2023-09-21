#![allow(unused)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

use front_commands::action_opts::{
  create_ziwei_app, del_app_by_id, get_app_by_id, query_ziwei_apps, toggle_app_running_status,
  toggle_app_zip_status,
};
use front_commands::file_opts::{get_resource_file, greet, unzip_file};
use front_commands::sys_opts::{
  check_port_is_available, close_splashscreen, get_available_port_list, run_local_server,
};

use std::sync::Mutex;

mod front_commands;

mod server;

mod local_db;

mod pb;

mod engine;

mod sys_config;

use sys_config::{config_tray, handle_sys_tray_event};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//   format!("Hello, {}! You've been greeted from Rust!", name)
// }

pub struct Counter {
  count: Mutex<i32>,
}

fn main() {
  let custom_tray = config_tray();
  // create a new Tauri application builder with default settings
  tauri::Builder::default()
    .setup(|app| {
      let splashscreen_window = app.get_window("splashscreen").unwrap();
      let main_window = app.get_window("main").unwrap();
      // we perform the initialization code on a new task so the app doesn't freeze
      tauri::async_runtime::spawn(async move {
        // initialize your app here instead of sleeping :)
        // initialize the database
        local_db::init();

        // std::thread::sleep(std::time::Duration::from_secs(3));
        println!("Done initializing.");

        // After it's done, close the splashscreen and display the main window
        // splashscreen_window.close().unwrap();
        // main_window.show().unwrap();
      });

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
      toggle_app_zip_status,
      get_app_by_id,
      del_app_by_id
    ])
    .system_tray(custom_tray)
    .on_system_tray_event(|app, event| handle_sys_tray_event(app, event))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
