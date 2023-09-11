use actix_files::NamedFile;
use actix_web::{middleware, web, App, HttpRequest, HttpServer, Result as AWResult};
use anyhow::Result;
use bytes::Bytes;
use handlers::{example, routes};
use lru::LruCache;
use std::{
  collections::hash_map::DefaultHasher,
  convert::TryInto,
  hash::{Hash, Hasher},
  path::PathBuf,
  sync::{Arc, Mutex},
};
use tauri::AppHandle;
use tracing::{info, instrument};

mod handlers;

struct TauriAppState {
  app: Mutex<AppHandle>,
}

type Cache = Arc<Mutex<LruCache<u64, Bytes>>>;

async fn index(req: HttpRequest) -> AWResult<NamedFile> {
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
  // initiating tracing
  tracing_subscriber::fmt::init();
  let cache: Cache = Arc::new(Mutex::new(LruCache::new(1024)));

  HttpServer::new(move || {
    App::new()
      .app_data(tauri_app.clone())
      .wrap(middleware::Logger::default())
      .wrap(cache)
      .service(example::handle)
      .service(routes::image_handle)
      .service(routes::hello)
      .service(routes::index)
  })
  .bind(("127.0.0.1", 4875))?
  .run()
  .await
}
