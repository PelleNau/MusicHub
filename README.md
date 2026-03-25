# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Tauri v2 shell scaffold in `src-tauri/`

## Desktop shell scaffold

This repo now includes a Tauri v2 desktop-shell scaffold that wraps the existing
frontend and launches the JUCE `plugin_host` binary as a sidecar.

Key paths:
- `src-tauri/`
- `docs/tauri-shell.md`

Helpful commands:

```sh
npm run tauri:dev
npm run tauri:build
```

Before those work on a fresh machine you still need:
- Rust / Cargo installed
- the Tauri CLI dependency installed via `npm install`
- CMake installed if the local `plugin-host` project needs to be built

Note:
- the default Tauri build is currently set to bundle the `.app` only
- DMG packaging is intentionally deferred until the shell packaging pass is hardened
- `src-tauri/build.rs` now provisions the target-specific sidecar automatically when
  `src-tauri/binaries/` is empty
- by default the build looks for a sibling `plugin-host` project and uses
  `build/plugin_host_artefacts/plugin_host`
- override the source binary with `PLUGIN_HOST_BINARY=/absolute/path/to/plugin_host`
- override the source project with `PLUGIN_HOST_PROJECT_DIR=/absolute/path/to/plugin-host`
- set `MUSICHUB_BUILD_PLUGIN_HOST=0` to disable auto-build and require a prebuilt binary

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
