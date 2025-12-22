// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

struct PythonProcess(Mutex<Option<Child>>);

fn start_python_backend(app_handle: &AppHandle) -> Result<Child, String> {
    #[cfg(debug_assertions)]
    let backend_path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("backend");

    #[cfg(not(debug_assertions))]
    let backend_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?
        .join("backend");

    println!("Backend path: {:?}", backend_path);

    if !backend_path.exists() {
        return Err(format!(
            "Backend directory not found at: {:?}",
            backend_path
        ));
    }

    let api_file = backend_path.join("api.py");
    if !api_file.exists() {
        return Err(format!("api.py not found at: {:?}", api_file));
    }

    #[cfg(target_os = "macos")]
    let python_cmd = "python3";

    #[cfg(target_os = "windows")]
    let python_cmd = backend_path.join("python-embed").join("python.exe");

    #[cfg(target_os = "linux")]
    let python_cmd = "python3";

    println!("Starting Python backend with command: {:?}", python_cmd);
    println!("Working directory: {:?}", backend_path);

    let child = Command::new(python_cmd)
        .arg("-m")
        .arg("uvicorn")
        .arg("api:app")
        .arg("--host")
        .arg("127.0.0.1")
        .arg("--port")
        .arg("8000")
        .current_dir(&backend_path)
        .spawn()
        .map_err(|e| format!("Failed to start Python: {}", e))?;

    println!("✅ Python backend started on http://localhost:8000");
    Ok(child)
}

fn stop_python_backend(process: &mut Option<Child>) {
    if let Some(mut child) = process.take() {
        let _ = child.kill();
        println!("🛑 Python backend stopped");
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();

            match start_python_backend(&app_handle) {
                Ok(child) => {
                    app.manage(PythonProcess(Mutex::new(Some(child))));
                    println!("🚀 Backend started successfully!");
                }
                Err(e) => {
                    eprintln!("❌ Failed to start backend: {}", e);
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Ok(state) = window.state::<PythonProcess>().0.try_lock() {
                    let mut process = state;
                    stop_python_backend(&mut process);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
