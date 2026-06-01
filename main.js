const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

const APP_ICON = path.join(__dirname, 'LABLOG icono blanco.png');

const windowOptions = {
  autoHideMenuBar: true,
  icon: APP_ICON,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
};

let mainWindow;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    ...windowOptions
  });

  mainWindow.loadFile('renderer/index.html');

}

ipcMain.on("abrir-arbol", (event, data) => {

  let treeWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    parent: BrowserWindow.getFocusedWindow(),
    modal: true,
    ...windowOptions
  });

  treeWindow.loadFile("renderer/arbol.html");

  treeWindow.webContents.on("did-finish-load", () => {

    treeWindow.webContents.send("datos-arbol", data);

  });

});

ipcMain.on("salir-app", () => {
  app.quit();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});
  // mainWindow.webContents.openDevTools();

/*ipcMain.on("enviar-arbol", (event, eventos) => {
  ventanaArbol.webContents.send("datos-arbol", eventos);
});*/

