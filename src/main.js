// Terminal Designer — Electron main process.
// The renderer process cannot access the filesystem directly; configuration writing is constrained here to allowed directories.
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const HOME = os.homedir();
const ALLOWED_DIRS = [
  '.config/fastfetch',
  '.config/fish/functions',
  '.config/kitty',
  '.config/alacritty',
  '.local/share/konsole',
].map(d => path.join(HOME, d));

function safeTarget(rel) {
  const target = path.resolve(HOME, rel);
  if (!ALLOWED_DIRS.includes(path.dirname(target))) throw new Error(`not allowed: ${rel}`);
  return target;
}

function backup(file) {
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
}

function writeFile(target, data) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  backup(target);
  fs.writeFileSync(target, data);
}

function kittyInclude() {
  const conf = path.join(HOME, '.config/kitty/kitty.conf');
  fs.mkdirSync(path.dirname(conf), { recursive: true });
  const text = fs.existsSync(conf) ? fs.readFileSync(conf, 'utf8') : '';
  if (!text.includes('include terminal-designer.conf')) {
    fs.writeFileSync(conf, text + (text && !text.endsWith('\n') ? '\n' : '') + 'include terminal-designer.conf\n');
  }
}

// --- Minimal, order-preserving reader/writer for KDE-style INI files ---
function readIni(file) {
  const ini = new Map();
  if (!fs.existsSync(file)) return ini;
  let sec = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\[(.+)\]\s*$/);
    if (m) { sec = m[1]; if (!ini.has(sec)) ini.set(sec, new Map()); continue; }
    const eq = line.indexOf('=');
    if (sec && eq > 0) ini.get(sec).set(line.slice(0, eq), line.slice(eq + 1));
  }
  return ini;
}
function writeIni(file, ini) {
  const out = [...ini].map(([sec, kv]) => `[${sec}]\n` + [...kv].map(([k, v]) => `${k}=${v}`).join('\n')).join('\n\n');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  backup(file);
  fs.writeFileSync(file, out + '\n');
}
function setIni(ini, sec, key, val) {
  if (!ini.has(sec)) ini.set(sec, new Map());
  ini.get(sec).set(key, val);
}

// Sets color scheme to TerminalDesigner in Konsole's default profile (creates profile if missing).
function konsoleProfile() {
  const rcPath = path.join(HOME, '.config/konsolerc');
  const profDir = path.join(HOME, '.local/share/konsole');
  const rc = readIni(rcPath);
  let name = rc.get('Desktop Entry')?.get('DefaultProfile') || '';
  let profPath = name && path.join(profDir, name);
  if (!profPath || !fs.existsSync(profPath)) {
    name = 'TerminalDesigner.profile';
    profPath = path.join(profDir, name);
    setIni(rc, 'Desktop Entry', 'DefaultProfile', name);
    writeIni(rcPath, rc);
  }
  const prof = readIni(profPath);
  if (!prof.get('General')?.has('Name')) setIni(prof, 'General', 'Name', 'Terminal Designer');
  setIni(prof, 'Appearance', 'ColorScheme', 'TerminalDesigner');
  writeIni(profPath, prof);
  return path.relative(HOME, profPath);
}

ipcMain.handle('apply', (_e, { files, kitty, konsole }) => {
  try {
    const written = [];
    for (const f of files) {
      writeFile(safeTarget(f.path), Buffer.from(f.b64, 'base64'));
      written.push(f.path);
    }
    if (kitty) kittyInclude();
    if (konsole) written.push(konsoleProfile());
    return { ok: true, written };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 880,
    minWidth: 900,
    minHeight: 600,
    title: 'Terminal Designer',
    backgroundColor: '#1c1c1e',
    icon: path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.removeMenu();
  // Open external links in the user's default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
