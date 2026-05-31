const { app, BrowserWindow } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 480, height: 720, minWidth: 360, minHeight: 560,
    backgroundColor: '#0f172a',
    title: 'لعبة إكس أو — XO',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'www', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
