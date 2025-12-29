# mkarchi Desktop

MkArchi Desktop is the ultimate graphical interface for MkArchi CLI, the modular architecture engine.

It empowers developers to visually design, apply, and share architectural structures seamlessly.
Auto-updates ensure you’re always on the latest version, and integrated CLI checks guarantee compatibility with your workflow.

Think of it as a rocket-powered control center for your architecture projects — download, design, deploy.

## Features

### 🚀 Create Project (Apply Mode)
- Select destination folder with file browser
- Paste architecture tree in a large text area
- Optional preview before generation
- One-click project generation
- Real-time logs and progress

### 🔍 Extract Structure (Give Mode)
- Select existing project folder
- Configure extraction options:
  - Include file content (`-c`)
  - Max depth control
  - Ignore patterns
  - File size limits (`-max=<kb>`, `--no-max`)
  - Include ignored files (`--no-ignore`)
- Copy output to clipboard
- Export to file

### 🎨 Modern UI
- Dark developer-focused theme
- Tab-based navigation
- Collapsible logs panel
- Real-time status updates
- Smooth animations

## Prerequisites

**mkarchi CLI must be installed** on your system. Install it via pip:

```bash
pip install mkarchi
```

Verify installation:

```bash
mkarchi --version
```

## Installation

### Development Setup

1. **Clone or navigate to the project:**
   ```bash
   cd electron
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

### Building for Production

Build for your platform:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build
```

The built application will be in the `dist/` folder.

## Usage

### Create Project (Apply Mode)

1. Click the **"Create Project"** tab
2. Click **"Browse"** to select a destination folder
3. Paste your mkarchi architecture tree in the text area:
   ```
   my-app/
   ├── src/
   │   ├── index.js
   │   └── utils.js
   ├── package.json
   └── README.md
   ```
4. (Optional) Enable preview to see what will be generated
5. Click **"Generate Project"**
6. Check the logs for progress and results

### Extract Structure (Give Mode)

1. Click the **"Extract Structure"** tab
2. Click **"Browse"** to select a project folder
3. Configure options as needed:
   - **Include file content**: Add `-c` flag
   - **Max Depth**: Limit directory traversal depth
   - **Max File Size**: Set size limit in KB
   - **No size limit**: Use `--no-max` flag
   - **Include ignored files**: Use `--no-ignore` flag
   - **Ignore Patterns**: Comma-separated patterns (e.g., `node_modules, .git`)
4. Click **"Extract Structure"**
5. View the output in the text area
6. Use **"Copy"** or **"Export"** buttons to save the result

## Keyboard Shortcuts

- `Ctrl/Cmd + 1`: Switch to Create Project mode
- `Ctrl/Cmd + 2`: Switch to Extract Structure mode
- `Ctrl/Cmd + L`: Toggle logs panel

## Project Structure

```
electron/
├── main.js              # Main process (Electron backend)
├── preload.js           # Preload script (IPC bridge)
├── renderer.js          # Renderer process (UI logic)
├── mkarchi-cli.js       # CLI integration module
├── index.html           # Application UI
├── styles.css           # Styling
├── assets/              # Logo and images
│   └── logo.png
└── package.json         # Project configuration
```

## How It Works

1. **Main Process** (`main.js`): Handles window creation, IPC communication, and system dialogs
2. **Preload Script** (`preload.js`): Secure bridge between renderer and main process
3. **Renderer Process** (`renderer.js`): UI logic and user interactions
4. **CLI Module** (`mkarchi-cli.js`): Executes mkarchi commands via Node.js `child_process`

The application **does not reimplement** mkarchi logic - it calls the existing CLI tool.

## Troubleshooting

### "mkarchi not installed" error

The app requires mkarchi CLI to be installed. Install it:

```bash
pip install mkarchi
```

Make sure `mkarchi` is in your system PATH.

### Application won't start

1. Ensure all dependencies are installed: `npm install`
2. Check Node.js version (requires Node 16+)
3. Check the console for errors

### Build fails

1. Install electron-builder: `npm install --save-dev electron-builder`
2. Ensure assets/logo.png exists
3. Check build configuration in package.json

## Development

To enable DevTools for debugging:

```bash
# Set environment variable
set NODE_ENV=development  # Windows
export NODE_ENV=development  # macOS/Linux

# Run the app
npm start
```

## License

MIT License - Created by Soufyan Rachdi

## Links

- [mkarchi Website](https://mkarchi.vercel.app/)
- [mkarchi GitHub](https://github.com/SoufyanRachdi/mkarchi)
- [Documentation](https://mkarchi.vercel.app/learn/0.1.7)

---

**Made with ❤️ for developers who love clean architecture**
