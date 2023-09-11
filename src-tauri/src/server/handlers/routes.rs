use actix_web::{error, get, post, web, Responder};
use percent_encoding::percent_decode_str;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use web::{Json, Path};

use crate::pb::ImageSpec;

#[derive(Deserialize, Serialize)]
struct ImageHandleParams {
  spec: String,
  url: String,
}

#[get("/")]
async fn index() -> impl Responder {
  "Hello, World!"
}

#[get("/{name}")]
async fn hello(name: Path<String>) -> impl Responder {
  format!("Hi, {}", &name)
}

#[post("/image")]
async fn image_handle(data: Json<ImageHandleParams>) -> impl Responder {
  let ImageHandleParams { spec, url } = data.into_inner();

  let url = percent_decode_str(&url).decode_utf8_lossy();
  let spec: ImageSpec = spec
    .as_str()
    .try_into()
    .map_err(|_| error::ErrorBadRequest("spec error"))
    .unwrap();

  format!("url: {}\n spec: {:#?}", url, spec)
}
