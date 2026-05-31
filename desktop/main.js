const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// --- Single Instance Lock: منع فتح أكثر من نسخة ---
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let mainWin = null;

  app.on('second-instance', () => {
    // لو حاول المستخدم فتح نسخة ثانية، نُركّز النافذة الموجودة
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  function createWindow() {
    mainWin = new BrowserWindow({
      width: 480, height: 760, minWidth: 360, minHeight: 560,
      backgroundColor: '#0f172a',
      title: 'لعبة إكس أو — XO',
      icon: path.join(__dirname, 'build', 'icon.png'),
      webPreferences: { contextIsolation: true, nodeIntegration: false }
    });
    Menu.setApplicationMenu(null);
    mainWin.setMenuBarVisibility(false);
    mainWin.loadFile(path.join(__dirname, 'www', 'index.html'));
    mainWin.on('closed', () => { mainWin = null; });
  }

  app.whenReady().then(() => {
    createWindow();

    // --- Auto-Update (يعمل فقط في النسخ المعبّأة، يتجاهل بصمت في dev) ---
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.autoDownload = true;
      autoUpdater.on('update-downloaded', () => {
        // يُثبّت التحديث عند الإغلاق التالي
        autoUpdater.quitAndInstall(true, false);
      });
      // يتحقق من التحديثات (يحتاج publish provider مُعرّف وقت النشر)
      if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {});
      }
    } catch (e) { /* electron-updater غير متاح في dev — تجاهل */ }
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}
