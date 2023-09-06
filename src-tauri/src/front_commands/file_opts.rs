use std::fs;
use std::io;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Runtime;
use zip::ZipArchive;

#[tauri::command]
pub fn greet(name: &str) -> String {
  format!("Hi, {name}")
}

#[tauri::command]
pub async fn getPackageListByFolder<R: Runtime>(
  app: tauri::AppHandle<R>,
  window: tauri::Window<R>,
  folderName: &str,
) -> Result<(), String> {
  Ok(())
}

#[tauri::command]
pub fn unzip_file(source_file: &str, target_dir: &str) -> Result<bool, String> {
  let file = fs::File::open(source_file).unwrap();

  let mut archive = ZipArchive::new(file).unwrap();

  for i in 0..archive.len() {
    let mut file = archive.by_index(i).unwrap();

    // let out_path = match file.enclosed_name() {
    //   Some(path) => path.to_owned(),
    //   None => continue,
    // };
    let out_path = format!("{}/{}", target_dir, file.name());
    let out_path = PathBuf::from(out_path);

    {
      let comment = file.comment();

      if !comment.is_empty() {
        println!("File {i} comment: {comment}");
      }
    }

    if (*file.name()).ends_with('/') {
      println!("File {} extracted to \"{}\"", i, out_path.display());
      fs::create_dir_all(&out_path).unwrap();
    } else {
      println!(
        "File {} extracted to \"{}\" ({} bytes)",
        i,
        out_path.display(),
        file.size()
      );

      if let Some(p) = out_path.parent() {
        if !p.exists() {
          fs::create_dir_all(p).unwrap();
        }
      }

      let mut out_file = fs::File::create(&out_path).unwrap();

      io::copy(&mut file, &mut out_file).unwrap();
    }
  }
  Ok((true))
}

#[tauri::command]
pub fn get_resource_file(handle: AppHandle) -> String {
  let resource_path = handle
    .path_resolver()
    .resolve_resource("lang/de.json")
    .expect("failed to resolve resource");

  let file = std::fs::File::open(&resource_path).unwrap();

  let land_de: serde_json::Value = serde_json::from_reader(file).unwrap();

  land_de.get("hello").unwrap().to_string()
}
