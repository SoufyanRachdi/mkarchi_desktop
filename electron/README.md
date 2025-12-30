# mkarchi Desktop

MkArchi Desktop is the official graphical user interface for the **mkarchi CLI**, designed to make architecture management seamless and visual. It allows developers to design, apply, and extract project structures without needing to memorize command-line arguments.

This application acts as a bridge to the `mkarchi` core, providing a modern experience with real-time logs, error handling, and visual previews.

## 🚀 Features

*   **Create Project (Apply Mode)**
    *   Visual editor for architecture trees.
    *   One-click project generation.
    *   Real-time progress feedback.
*   **Extract Structure (Give Mode)**
    *   Turn existing folders into mkarchi definitions.
    *   Configurable options (ignore patterns, depth limits, file content).
    *   Export to clipboard or file.
*   **Auto-Updates**: Always stay on the latest version with background updates.
*   **Modern UI**: Dark-themed, developer-centric interface with smooth animations.

---

## 🛠️ Prerequisites

The Desktop app relies on the `mkarchi` CLI to perform core operations. You must have it installed on your system.

**Install mkarchi via pip:**

```bash
pip install mkarchi
```

Verify the installation:

```bash
mkarchi --version
```

---

## 📥 Installation

### For Users

1.  Go to the [Releases](https://github.com/SoufyanRachdi/mkarchi_desktop/releases) page.
2.  Download the installer for your operating system:
    *   **Windows**: `mkarchi-desktop-setup-x.x.x.exe`
    *   **macOS**: `mkarchi-desktop-x.x.x.dmg`
    *   **Linux**: `mkarchi-desktop-x.x.x.AppImage`
3.  Run the installer to set up the application.

### For Developers

If you want to contribute or modify the source code:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SoufyanRachdi/mkarchi_desktop.git
    cd mkarchi_desktop/electron
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run in development mode:**
    ```bash
    npm start
    ```

4.  **Build for production:**
    ```bash
    npm run build       # Build for current OS
    npm run build:win   # Windows
    npm run build:mac   # macOS
    npm run build:linux # Linux
    ```

---

## 📖 Usage

### 1. Creating a Project (Apply Mode)

Use this mode to scaffold a new project structure from a text definition.

1.  Open the **"Create Project"** tab.
2.  **Destination**: Click "Browse" to select the folder where you want to generate the files.
3.  **Architecture Tree**: Paste your structure in the text area. Example:
    ```text
    my-app/
    ├── src/
    │   ├── components/
    │   │   └── Header.jsx
    │   └── App.js
    ├── package.json
    └── README.md
    ```
4.  Click **"Generate Project"**.
5.  Watch the "Logs" panel for success confirmation.

### 2. Extracting Structure (Give Mode)

Use this mode to generate a text definition from an existing folder.

1.  Open the **"Extract Structure"** tab.
2.  **Source**: Click "Browse" to select the project folder you want to analyze.
3.  **Configure Options**:
    *   **Include Content**: Toggle to read file contents into the output.
    *   **Max Depth**: Limit how deep the tool traverses.
    *   **Ignore Patterns**: Exclude specific files (e.g., `node_modules, .git`).
    *   **Max Size**: Skip files larger than a specific size (KB).
4.  Click **"Extract Structure"**.
5.  The result will appear in the text area. Click **"Copy"** to save it to your clipboard.

---

## 🔄 Auto-Updates

MkArchi Desktop includes a built-in auto-updater.

*   **How it works**: Every time you launch the application, it checks GitHub Releases for a newer version.
*   **Updating**: If an update is available, it downloads in the background. You will be notified when it's ready to install (usually on the next restart).
*   **Manual Check**: You can see the current version in the window title or "Help" menu.

---

## 🔧 Troubleshooting

*   **"mkarchi not installed"**: The app depends on the CLI. Run `pip install mkarchi` and restart the app.
*   **Permission Denied**: Try running the app as Administrator if you are writing to protected directories.
*   **Build Errors**: Ensure you have Node.js 16+ installed. If building for a different OS, you might need specific system dependencies (e.g., `wine` for Windows on Linux).

---

## 📄 License & Versioning

*   **Version**: 0.1.0
*   **License**: MIT
*   **Author**: Soufyan Rachdi

For full documentation of the CLI tool syntax, visit the [official mkarchi documentation](https://mkarchi.vercel.app/).
