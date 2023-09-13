use actix_files::NamedFile;
use actix_web::dev::Service;
use actix_web::middleware::{ErrorHandlerResponse, ErrorHandlers, Logger};
use actix_web::{
  dev,
  http::{header, StatusCode},
  web, App, HttpRequest, HttpServer, Result as AWResult,
};
use anyhow::Result;
use bytes::Bytes;
use env_logger::Env;
use handlers::{example, routes};
use lru::LruCache;
use std::num::NonZeroUsize;
use std::{
  collections::hash_map::DefaultHasher,
  convert::TryInto,
  hash::{Hash, Hasher},
  path::PathBuf,
  sync::Arc,
};
use tauri::AppHandle;
use tokio::sync::Mutex;
use tracing::{info, instrument};

mod handlers;

type Cache = Arc<Mutex<LruCache<u64, Bytes>>>;

pub struct TauriAppState {
  app: Mutex<AppHandle>,
  lru_caches: Cache,
}

async fn index(req: HttpRequest) -> AWResult<NamedFile> {
  let path: PathBuf = req.match_info().query("filename").parse().unwrap();
  print!("{:?}", path);
  Ok(NamedFile::open(path)?)
}

fn add_error_header<B>(mut res: dev::ServiceResponse<B>) -> AWResult<ErrorHandlerResponse<B>> {
  res.response_mut().headers_mut().insert(
    header::CONTENT_TYPE,
    header::HeaderValue::from_static("Error"),
  );

  Ok(ErrorHandlerResponse::Response(res.map_into_left_body()))
}

#[actix_web::main]
pub async fn init(app: AppHandle) -> std::io::Result<()> {
  let mut cache: Cache = Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(1024).unwrap())));

  let tauri_app = web::Data::new(TauriAppState {
    app: Mutex::new(app),
    lru_caches: cache,
  });
  // let localDir = app.clone().path_resolver().app_local_data_dir();
  // initiating tracing
  tracing_subscriber::fmt::init();
  // env_logger::init_from_env(Env::default().default_filter_or("info"));

  HttpServer::new(move || {
    App::new()
      .app_data(tauri_app.clone())
      .wrap_fn(|req, srv| {
        println!("Hi from start. You requested: {}", req.path());
        // if req.path() == srv.
        // cache.lock().unwrap().put(req., v)

        let fut = srv.call(req);

        Box::pin(async move {
          let res = fut.await?;

          Ok(res)
        })
      })
      .wrap(ErrorHandlers::new().handler(StatusCode::INTERNAL_SERVER_ERROR, add_error_header))
      .wrap(Logger::default())
      .wrap(Logger::new("%a %{User-Agent}i"))
      // .wrap(cache)
      .service(example::handle)
      .service(routes::image_handle)
      .service(routes::hello)
      .service(routes::index)
  })
  .workers(4)
  .bind(("127.0.0.1", 4875))?
  .run()
  .await
}
