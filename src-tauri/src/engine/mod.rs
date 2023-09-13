use crate::pb::Spec;
use image::ImageOutputFormat;

mod photon;

pub use photon::Photon;

// Engine trait: we can add more `engine` in future and only need to replace `engine` in main process
pub trait Engine {
  // processing `engine` with a series of ordered handling follow by specs
  fn apply(&mut self, specs: &[Spec]);

  // To generate target image from engine, note that it using `self`, not self reference
  fn generate(self, format: ImageOutputFormat) -> Vec<u8>;
}

// SpecTransform: if we want to add more spec in future, completing it only
pub trait SpecTransform<T> {
  // Taking `transform` to image with `op`
  fn transform(&mut self, op: T);
}
