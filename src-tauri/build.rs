use std::env;
use std::ffi::OsString;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;

use reqwest::blocking::Client;
use sha2::{Digest, Sha256};

fn main() {
    emit_rerun_hints();
    provision_plugin_host_sidecar();
    tauri_build::build();
}

fn emit_rerun_hints() {
    println!("cargo:rerun-if-env-changed=PLUGIN_HOST_BINARY");
    println!("cargo:rerun-if-env-changed=PLUGIN_HOST_DOWNLOAD_URL");
    println!("cargo:rerun-if-env-changed=PLUGIN_HOST_DOWNLOAD_SHA256");
    println!("cargo:rerun-if-env-changed=PLUGIN_HOST_PROJECT_DIR");
    println!("cargo:rerun-if-env-changed=MUSICHUB_BUILD_PLUGIN_HOST");
}

fn provision_plugin_host_sidecar() {
    let manifest_dir = manifest_dir();
    let target = env::var("TARGET").expect("TARGET is not set by Cargo");
    let binaries_dir = manifest_dir.join("binaries");
    let destination = binaries_dir.join(format!("plugin_host-{target}"));

    if destination.exists() {
        println!(
            "cargo:warning=plugin_host sidecar already provisioned at {}",
            destination.display()
        );
        println!("cargo:rerun-if-changed={}", destination.display());
        return;
    }

    fs::create_dir_all(&binaries_dir).unwrap_or_else(|error| {
        panic!(
            "Failed to create Tauri sidecar directory {}: {error}",
            binaries_dir.display()
        )
    });

    let source = resolve_plugin_host_source(&manifest_dir).unwrap_or_else(|message| {
        panic!(
            "{message}\nExpected sidecar destination: {}\nSet PLUGIN_HOST_BINARY to an existing binary or provide a local plugin-host project.",
            destination.display()
        )
    });

    copy_sidecar(&source, &destination);
    println!(
        "cargo:warning=Provisioned plugin_host sidecar from {}",
        source.display()
    );
    println!("cargo:rerun-if-changed={}", source.display());
    println!("cargo:rerun-if-changed={}", destination.display());
}

fn resolve_plugin_host_source(manifest_dir: &Path) -> Result<PathBuf, String> {
    if let Some(explicit_binary) = resolve_explicit_binary(manifest_dir)? {
        return Ok(explicit_binary);
    }

    if let Some(downloaded_binary) = resolve_downloaded_binary(manifest_dir)? {
        return Ok(downloaded_binary);
    }

    if let Some(project_dir) = resolve_plugin_host_project_dir(manifest_dir) {
        match ensure_project_binary(&project_dir) {
            Ok(binary_path) => return Ok(binary_path),
            Err(error) => {
                return Err(format!(
                    "Failed to provision plugin_host from project {}: {error}",
                    project_dir.display()
                ))
            }
        }
    }

    let local_debug_binary = manifest_dir.join("target/debug/plugin_host");
    if local_debug_binary.exists() {
        return Ok(local_debug_binary);
    }

    Err(format!(
        "Unable to find plugin_host sidecar. Searched PLUGIN_HOST_BINARY, PLUGIN_HOST_DOWNLOAD_URL, PLUGIN_HOST_PROJECT_DIR, ancestor plugin-host releases/builds, and {}.",
        local_debug_binary.display()
    ))
}

fn resolve_explicit_binary(manifest_dir: &Path) -> Result<Option<PathBuf>, String> {
    let Some(raw_path) = env::var_os("PLUGIN_HOST_BINARY") else {
        return Ok(None);
    };
    let candidate = resolve_path(manifest_dir, &raw_path);
    if candidate.is_file() {
        return Ok(Some(candidate));
    }
    Err(format!(
        "PLUGIN_HOST_BINARY points to {}, but that file does not exist",
        candidate.display()
    ))
}

fn resolve_plugin_host_project_dir(manifest_dir: &Path) -> Option<PathBuf> {
    if let Some(raw_path) = env::var_os("PLUGIN_HOST_PROJECT_DIR") {
        let candidate = resolve_path(manifest_dir, &raw_path);
        if candidate.join("CMakeLists.txt").is_file() {
            return Some(candidate);
        }
    }

    manifest_dir
        .ancestors()
        .map(Path::to_path_buf)
        .find_map(|ancestor| {
            let candidate = ancestor.join("plugin-host");
            candidate.join("CMakeLists.txt").is_file().then_some(candidate)
        })
}

fn ensure_project_binary(project_dir: &Path) -> Result<PathBuf, String> {
    if let Some(release_binary) = discover_release_binary(project_dir)? {
        return Ok(release_binary);
    }

    let artifact = plugin_host_artifact(project_dir);
    if artifact.is_file() {
        return Ok(artifact);
    }

    let should_build = env::var("MUSICHUB_BUILD_PLUGIN_HOST")
        .map(|value| value != "0")
        .unwrap_or(true);
    if !should_build {
        return Err(format!(
            "project binary missing at {} and MUSICHUB_BUILD_PLUGIN_HOST=0",
            artifact.display()
        ));
    }

    run_cmake(project_dir)?;

    if artifact.is_file() {
        Ok(artifact)
    } else {
        Err(format!(
            "plugin_host build completed, but no binary was found at {}",
            artifact.display()
        ))
    }
}

fn run_cmake(project_dir: &Path) -> Result<(), String> {
    let build_dir = project_dir.join("build");

    let configure_status = Command::new("cmake")
        .arg("-S")
        .arg(project_dir)
        .arg("-B")
        .arg(&build_dir)
        .status()
        .map_err(|error| format!("failed to start cmake configure: {error}"))?;
    if !configure_status.success() {
        return Err(format!(
            "cmake configure failed with status {configure_status}"
        ));
    }

    let build_status = Command::new("cmake")
        .arg("--build")
        .arg(&build_dir)
        .status()
        .map_err(|error| format!("failed to start cmake build: {error}"))?;
    if !build_status.success() {
        return Err(format!("cmake build failed with status {build_status}"));
    }

    Ok(())
}

fn resolve_downloaded_binary(manifest_dir: &Path) -> Result<Option<PathBuf>, String> {
    let Some(download_url) = env::var_os("PLUGIN_HOST_DOWNLOAD_URL") else {
        return Ok(None);
    };

    let download_url = download_url
        .into_string()
        .map_err(|_| "PLUGIN_HOST_DOWNLOAD_URL is not valid UTF-8".to_string())?;
    if download_url.trim().is_empty() {
        return Ok(None);
    }

    let cache_dir = manifest_dir.join("target/plugin_host_download");
    fs::create_dir_all(&cache_dir).map_err(|error| {
        format!(
            "failed to create plugin_host download cache {}: {error}",
            cache_dir.display()
        )
    })?;

    let file_name = download_url
        .rsplit('/')
        .next()
        .filter(|segment| !segment.is_empty())
        .unwrap_or("plugin_host");
    let destination = cache_dir.join(file_name);

    if !destination.exists() {
        download_plugin_host(&download_url, &destination)?;
    }

    verify_downloaded_binary(&destination)?;

    Ok(Some(destination))
}

fn download_plugin_host(download_url: &str, destination: &Path) -> Result<(), String> {
    let client = Client::builder()
        .build()
        .map_err(|error| format!("failed to create HTTP client: {error}"))?;
    let response = client
        .get(download_url)
        .send()
        .map_err(|error| format!("failed to download {download_url}: {error}"))?;

    if !response.status().is_success() {
        return Err(format!(
            "downloading {download_url} failed with HTTP {}",
            response.status()
        ));
    }

    let bytes = response
        .bytes()
        .map_err(|error| format!("failed to read downloaded bytes from {download_url}: {error}"))?;
    let mut file = fs::File::create(destination).map_err(|error| {
        format!(
            "failed to create downloaded sidecar file {}: {error}",
            destination.display()
        )
    })?;
    file.write_all(&bytes).map_err(|error| {
        format!(
            "failed to write downloaded sidecar file {}: {error}",
            destination.display()
        )
    })?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut permissions = fs::metadata(destination)
            .map_err(|error| format!("failed to read downloaded file metadata: {error}"))?
            .permissions();
        permissions.set_mode(0o755);
        fs::set_permissions(destination, permissions)
            .map_err(|error| format!("failed to set execute permissions on download: {error}"))?;
    }

    Ok(())
}

fn verify_downloaded_binary(destination: &Path) -> Result<(), String> {
    let Some(expected_sha) = env::var_os("PLUGIN_HOST_DOWNLOAD_SHA256") else {
        return Ok(());
    };

    let expected_sha = expected_sha
        .into_string()
        .map_err(|_| "PLUGIN_HOST_DOWNLOAD_SHA256 is not valid UTF-8".to_string())?;
    let expected_sha = expected_sha.trim().to_ascii_lowercase();
    if expected_sha.is_empty() {
        return Ok(());
    }

    let bytes = fs::read(destination).map_err(|error| {
        format!(
            "failed to read downloaded sidecar {} for SHA256 verification: {error}",
            destination.display()
        )
    })?;
    let actual_sha = format!("{:x}", Sha256::digest(&bytes));
    if actual_sha != expected_sha {
        return Err(format!(
            "downloaded plugin_host SHA256 mismatch for {}: expected {expected_sha}, got {actual_sha}",
            destination.display()
        ));
    }

    Ok(())
}

fn discover_release_binary(project_dir: &Path) -> Result<Option<PathBuf>, String> {
    let current_release = project_dir.join("releases/current/plugin_host");
    if current_release.is_file() {
        return Ok(Some(current_release));
    }

    let releases_dir = project_dir.join("releases");
    if !releases_dir.is_dir() {
        return Ok(None);
    }

    let mut candidates = Vec::new();
    for entry in fs::read_dir(&releases_dir).map_err(|error| {
        format!(
            "failed to read plugin_host releases directory {}: {error}",
            releases_dir.display()
        )
    })? {
        let entry = entry.map_err(|error| format!("failed to read releases entry: {error}"))?;
        let path = entry.path();
        let binary_path = path.join("plugin_host");
        if binary_path.is_file() {
            candidates.push(binary_path);
        }
    }

    candidates.sort();
    Ok(candidates.pop())
}

fn copy_sidecar(source: &Path, destination: &Path) {
    fs::copy(source, destination).unwrap_or_else(|error| {
        panic!(
            "Failed to copy plugin_host from {} to {}: {error}",
            source.display(),
            destination.display()
        )
    });

    let permissions = fs::metadata(source)
        .unwrap_or_else(|error| {
            panic!(
                "Failed to read plugin_host metadata from {}: {error}",
                source.display()
            )
        })
        .permissions();
    fs::set_permissions(destination, permissions).unwrap_or_else(|error| {
        panic!(
            "Failed to set plugin_host permissions on {}: {error}",
            destination.display()
        )
    });
}

fn plugin_host_artifact(project_dir: &Path) -> PathBuf {
    project_dir.join("build/plugin_host_artefacts/plugin_host")
}

fn manifest_dir() -> PathBuf {
    PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is not set"))
}

fn resolve_path(base_dir: &Path, raw_path: &OsString) -> PathBuf {
    let candidate = PathBuf::from(raw_path);
    if candidate.is_absolute() {
        candidate
    } else {
        base_dir.join(candidate)
    }
}
