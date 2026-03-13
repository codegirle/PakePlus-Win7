import { app, BrowserWindow, Menu, shell, dialog } from 'electron'
import path from 'path'
import config from './config'

const WEBSITE_URL = config.url

let mainWindow: BrowserWindow | null

function createWindow() {
    mainWindow = new BrowserWindow({
        width: config.width,
        height: config.height,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
        show: false,
        backgroundColor: '#ffffff',
    })

    if (WEBSITE_URL) {
        mainWindow.loadURL(WEBSITE_URL)
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()

        if (config.openDevTools) {
            mainWindow?.webContents.openDevTools()
        }
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })
}

function createMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: '文件',
            submenu: [
                {
                    label: '刷新',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow?.reload()
                    },
                },
                {
                    label: '强制刷新',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow?.webContents.reloadIgnoringCache()
                    },
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator:
                        process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit()
                    },
                },
            ],
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '实际大小',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow?.webContents.setZoomLevel(0)
                    },
                },
                {
                    label: '放大',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        if (!mainWindow) return
                        const currentZoom =
                            mainWindow.webContents.getZoomLevel()
                        mainWindow.webContents.setZoomLevel(currentZoom + 0.5)
                    },
                },
                {
                    label: '缩小',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        if (!mainWindow) return
                        const currentZoom =
                            mainWindow.webContents.getZoomLevel()
                        mainWindow.webContents.setZoomLevel(currentZoom - 0.5)
                    },
                },
                { type: 'separator' },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow?.webContents.toggleDevTools()
                    },
                },
            ],
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        if (!mainWindow) return
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于',
                            message: config.appTitle,
                            detail: '跨平台桌面应用\n支持 Windows 7',
                        })
                    },
                },
            ],
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
    createWindow()
    createMenu()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on(
    'certificate-error',
    (event, webContents, url, error, certificate, callback) => {
        event.preventDefault()
        callback(true)
    }
)
