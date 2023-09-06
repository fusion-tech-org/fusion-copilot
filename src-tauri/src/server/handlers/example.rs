use actix_web::post;

#[post("/api/test")]
pub async fn handle() -> actix_web::Result<String> {
  let text = "Hello Fujia";

  print!("{}", text);

  Ok(text.to_string())
}
