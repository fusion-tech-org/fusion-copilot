mod handlers;

use actix_files::NamedFile;
use actix_web::{middleware, web, App, HttpRequest, HttpServer, Result};
use std::path::PathBuf;

use std::sync::Mutex;
use tauri::AppHandle;

struct TauriAppState {
  app: Mutex<AppHandle>,
}

async fn index(req: HttpRequest) -> Result<NamedFile> {
  let path: PathBuf = req.match_info().query("filename").parse().unwrap();
  print!("{:?}", path);
  Ok(NamedFile::open(path)?)
}

#[actix_web::main]
pub async fn init(app: AppHandle) -> std::io::Result<()> {
  let tauri_app = web::Data::new(TauriAppState {
    app: Mutex::new(app),
  });
  // let localDir = app.clone().path_resolver().app_local_data_dir();

  HttpServer::new(move || {
    App::new()
      .app_data(tauri_app.clone())
      .wrap(middleware::Logger::default())
      .service(handlers::example::handle)
  })
  .bind(("127.0.0.1", 4875))?
  .run()
  .await
}
