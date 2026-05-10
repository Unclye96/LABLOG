const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('renderer/index.html');

}

ipcMain.on("abrir-arbol", (event, data) => {

  let treeWindow = new BrowserWindow({
    width: 1000,
    height: 700,

    parent: BrowserWindow.getFocusedWindow(),

    modal: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  treeWindow.loadFile("renderer/arbol.html");

  treeWindow.webContents.on("did-finish-load", () => {

    treeWindow.webContents.send("datos-arbol", data);

  });

});

app.whenReady().then(createWindow);
  // mainWindow.webContents.openDevTools();

/*ipcMain.on("enviar-arbol", (event, eventos) => {
  ventanaArbol.webContents.send("datos-arbol", eventos);
});*/

