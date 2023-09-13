use actix_web::{
  error, get,
  http::{
    header::{ContentType, HeaderValue},
    StatusCode,
  },
  post, web, Error as AWError, HttpResponse, Responder, Result as AWResult,
};
use anyhow::Result;
use bytes::Bytes;
use futures::{future::ok, stream::once};
use lru::LruCache;
use percent_encoding::percent_decode_str;
use serde::{Deserialize, Serialize};
use std::num::NonZeroUsize;
use std::{
  collections::hash_map::DefaultHasher,
  convert::TryInto,
  hash::{Hash, Hasher},
  sync::Arc,
};
use tokio::sync::Mutex;
use tracing::{info, instrument};
use web::{Json, Path, Query};

use crate::pb::ImageSpec;
use crate::server::TauriAppState;
use crate::{
  engine::{Engine, Photon},
  pb::spec,
};
use image::ImageOutputFormat;

#[derive(Deserialize)]
struct ImageHandleQueries {
  spec: String,
  url: String,
}

type Cache = Arc<Mutex<LruCache<u64, Bytes>>>;

#[get("/")]
async fn index() -> impl Responder {
  "Hello, World!"
}

#[get("/{name}")]
async fn hello(name: Path<String>) -> impl Responder {
  format!("Hi, {}", &name)
}

#[get("/apps/{id}/{channel}/index.html")]
async fn get_static_app(info: Path<(u32, String)>) -> AWResult<String> {
  let info = info.into_inner();

  Ok(format!("id: {}, channel: {}", info.0, info.1))
}

#[instrument(level = "info", skip(cache))]
async fn retrieve_image(url: &str, cache: Cache) -> Result<Bytes> {
  let mut hasher = DefaultHasher::new();
  url.hash(&mut hasher);

  let key = hasher.finish();

  let g = &mut cache.lock().await;

  let data = match g.get(&key) {
    Some(v) => {
      info!("Match cache {}", key);
      v.to_owned()
    }
    None => {
      info!("Retrieve url");

      let resp = reqwest::get(url).await?;
      let data = resp.bytes().await?;
      g.put(key, data.clone());

      data
    }
  };

  Ok(data)
}

#[get("/image-handle")]
async fn image_handle(
  params: Query<ImageHandleQueries>,
  data: web::Data<TauriAppState>,
) -> impl Responder {
  let ImageHandleQueries { spec, url } = params.into_inner();
  let mut cache = &data.lru_caches;

  let spec: ImageSpec = spec.as_str().try_into().unwrap_or(ImageSpec::default());

  let url: &str = &percent_decode_str(&url).decode_utf8_lossy();

  let img_data = retrieve_image(&url, cache.clone())
    .await
    .map_err(|_| StatusCode::BAD_REQUEST);

  let engine_res: Result<Photon, StatusCode> = match img_data {
    Ok(data) => data.try_into().map_err(|_| StatusCode::BAD_REQUEST),
    Err(code) => Err(code),
  };

  match engine_res {
    Ok(mut engine) => {
      // handling image with image engine

      engine.apply(&spec.specs);

      let image = engine.generate(ImageOutputFormat::Jpeg((85)));
      info!("Finished processing: image size {}", image.len());

      HttpResponse::Ok()
        .content_type(HeaderValue::from_static("image/jpeg"))
        .body(image)
    }
    Err(_) => HttpResponse::Ok().body(StatusCode::BAD_REQUEST.as_str()),
  }
}
