use tauri::{
  AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
  SystemTrayMenuItem,
};

pub fn config_tray() -> SystemTray {
  // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
  let quit = CustomMenuItem::new("quit".to_string(), "退出");
  let hide = CustomMenuItem::new("hide".to_string(), "隐藏");

  let tray_menu = SystemTrayMenu::new()
    .add_item(quit)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(hide);

  let tray = SystemTray::new().with_menu(tray_menu);

  tray
}

pub fn handle_sys_tray_event(app: &AppHandle, event: SystemTrayEvent) {
  match event {
    SystemTrayEvent::LeftClick {
      tray_id,
      position,
      size,
      ..
    } => {
      println!("system tray received a left click");
    }
    SystemTrayEvent::RightClick {
      tray_id,
      position,
      size,
      ..
    } => {
      println!("system tray received a left click");
    }
    SystemTrayEvent::DoubleClick {
      position: _,
      size: _,
      ..
    } => {
      println!("system tray received a double click");
    }
    SystemTrayEvent::MenuItemClick { tray_id, id, .. } => match id.as_str() {
      "quit" => {
        std::process::exit(0);
      }
      "hide" => {
        let window = app.get_window("main").unwrap();
        window.hide().unwrap();
      }
      _ => {}
    },
    _ => {}
  }
}
