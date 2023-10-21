use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};
use std::ops::Range;
use std::process;
use std::process::Command;
use std::str::FromStr;
use std::{net::TcpListener, thread};
use tauri::{AppHandle, Manager, Window};
use tracing_subscriber::fmt::format;

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

#[tauri::command]
pub fn query_local_ip() -> String {
  let local_ip_addr = local_ip().map_err(|_| "Can not get local ip address".to_string());

  match local_ip_addr {
    Ok(v) => v.to_string(),
    Err(_) => "".to_string(),
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnixProcessInfo {
  command: String,
  pid: String,
  user: String,
  fd: String,
  ip_type: String,
  device: String,
  size_off: String,
  node: String,
  name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WinProcessInfo {
  command: String,
  pid: String,
  name: String,
}

#[tauri::command]
pub fn get_process_by_port_for_unix(port: usize) -> Result<Vec<UnixProcessInfo>, String> {
  let output = Command::new("lsof")
    .arg("-i")
    .arg(format!(":{}", port))
    .output()
    .unwrap();

  let shell_output = String::from_utf8(output.stdout).unwrap();

  // splitting by separator
  let info_vec: Vec<&str> = shell_output.split("\n").collect();
  let mut result: Vec<UnixProcessInfo> = vec![];

  // traversing loop and removing the title of first line and last lint empty string
  for (i, v) in info_vec.iter().enumerate() {
    if i <= 0 || i == info_vec.len() - 1 {
      continue;
    }

    // splittin by whitespace, to find corresponding values
    let values: Vec<&str> = v.split_whitespace().collect::<Vec<&str>>();

    result.push(UnixProcessInfo {
      command: values[0].into(),
      pid: values[1].into(),
      user: values[2].into(),
      fd: values[3].into(),
      ip_type: values[4].into(),
      device: values[5].into(),
      size_off: values[6].into(),
      node: values[7].into(),
      name: values[8].into(),
    });
  }

  Ok(result)
}

#[tauri::command]
pub fn get_process_by_port_for_win(port: usize) -> Result<Vec<WinProcessInfo>, String> {
  let output = Command::new("netstat").arg("-nao").output().unwrap();

  let shell_output = String::from_utf8(output.stdout).unwrap();
  println!("{}", shell_output);
  let info_vec: Vec<&str> = shell_output.split("\r\n").collect();

  let mut result: Vec<WinProcessInfo> = vec![];

  for (_, v) in info_vec.iter().enumerate() {
    let values: Vec<&str> = v.split_whitespace().collect::<Vec<&str>>();

    println!("{:?}", values);
  }

  Ok(result)
}
