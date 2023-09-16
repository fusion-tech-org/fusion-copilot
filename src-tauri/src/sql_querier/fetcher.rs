use anyhow::{anyhow, Result};
use async_trait::async_trait;
use tokio::fs;

// NOTE: Rust's async trait is not stable now, we can use async_trait macro
#[async_trait]
pub trait Fetch {
  type Error;

  async fn fetch(&self) -> Result<String, Self::Error>;
}

/// fetches data from file source or http source to compose data frame
pub async fn retrieve_data(source: impl AsRef<str>) -> Result<String> {
  let name = source.as_ref();
  match &name[..4] {
    // include http/https
    "http" => UrlFetcher(name).fetch().await,
    // handles file://<filename>
    "file" => FileFetcher(name).fetch().await,
    _ => return Err(anyhow!("we only support http/https/file now")),
  }
}

struct UrlFetcher<'a>(pub(crate) &'a str);

struct FileFetcher<'a>(pub(crate) &'a str);

#[async_trait]
impl<'a> Fetch for UrlFetcher<'a> {
  type Error = anyhow::Error;

  async fn fetch(&self) -> Result<String, Self::Error> {
    Ok(reqwest::get(self.0).await?.text().await?)
  }
}

#[async_trait]
impl<'a> Fetch for FileFetcher<'a> {
  type Error = anyhow::Error;

  async fn fetch(&self) -> Result<String, Self::Error> {
    Ok(fs::read_to_string(&self.0[7..]).await?)
  }
}
