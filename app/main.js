
'use strict';

var url = require('url');
var path = require('path');
var electron = require('electron');
var win = null;


electron.app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, getPluginName()));
electron.app.commandLine.appendSwitch('ppapi-flash-version', '28_0_0_126');

electron.app.on('ready', createWindowFn);
electron.app.on('activate', activateFn);
electron.app.on('window-all-closed', closedFn);

/* -------------------------------- FUNCTION DETAILS --------------------------------- */

function closedFn() {
    process.platform !== 'darwin' && electron.app.quit();
}

function activateFn() {
    win === null && createWindowFn();
}

function getPluginName() {
    var pluginName;
    
    switch (process.platform) {
        case 'win32':
            pluginName = 'js/Flash/pepflashplayer64_28_0_0_126.dll';
            break;
        case 'darwin':
            pluginName = 'js/Flash_mac/PepperFlashPlayer.plugin';
            break;
        case 'linux':
            pluginName = 'js/Flash_Linux/libpepflashplayer.so';
            break;
        default:
            pluginName = 'js/Flash/pepflashplayer64_28_0_0_126.dll';
            break;
    }
    return pluginName;
}

function createWindowFn () {
    (win = new electron.BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 600,
        minHeight: 400,
        title: 'Dv3sel',
        x: 100,
        y: 20,
        backgroundColor: '#2e2c29',
        webPreferences: {
            "nodeIntegration": false,
            "contextIsolation": true,
            "plugins": true
        }
    }))
    // and load the index.html of the app.
    .loadURL( url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
//     Open the DevTools.
    win.webContents.openDevTools();
    // reload window
    // win.webContents.reloadIgnoringCache();

    win.on('closed', function () {
        win = null;
    });
}