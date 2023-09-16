use std::ops::Range;
use std::str::FromStr;
use std::{net::TcpListener, thread};
use tauri::{AppHandle, Manager, Window};

use crate::server;

// Create the command:
// This command must be async so that it doesn't run on the main thread.
#[tauri::command]
pub async fn close_splashscreen(app: tauri::AppHandle, window: tauri::Window) {
  // close splashscreen
  window
    .get_window("splashscreen")
    .expect("no window labeled 'splashscreen' found")
    .close()
    .unwrap();
  // show main window
  window
    .get_window("main")
    .expect("no window labeled 'main' found")
    .show()
    .unwrap();
}

#[tauri::command]
pub async fn run_local_server(app: tauri::AppHandle) -> bool {
  let handle = app.app_handle();
  let boxed_handle = Box::new(handle);

  thread::spawn(move || {
    server::init(*boxed_handle).unwrap();
  });

  true
}

#[tauri::command]
pub fn get_available_port_list(port_range: &str) -> Option<u16> {
  let convert_vec: Vec<u16> = port_range
    .split("..")
    .map(|s| match s.parse::<u16>() {
      Ok(p) => p,
      Err(_) => 9527,
    })
    .collect();

  let mut convert_range_pot = Range {
    start: convert_vec[0],
    end: convert_vec[1],
  };

  convert_range_pot.find(|port| check_port_is_available(*port))
}

#[tauri::command]
pub fn check_port_is_available(port: u16) -> bool {
  match TcpListener::bind(("127.0.0.1", port)) {
    Ok(_) => true,
    Err(_) => false,
  }
}
