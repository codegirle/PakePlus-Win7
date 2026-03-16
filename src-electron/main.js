const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')
const config = require('./config.json')

const WEBSITE_URL = config.url

let mainWindow = null

// create the window
async function createWindow() {
    const partition = config.incognito ? 'temp' : undefined

    mainWindow = new BrowserWindow({
        width: config.width,
        height: config.height,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        title: config.title,
        resizable: config.resizable,
        fullscreen: config.fullscreen,
        frame: config.decorations,
        transparent: config.transparent,
        titleBarStyle: config.titleBarStyle,
        closable: config.closable,
        minimizable: config.minimizable,
        maximizable: config.maximizable,
        alwaysOnTop: config.alwaysOnTop,
        center: config.center,
        hasShadow: config.shadow,
        skipTaskbar: config.skipTaskbar,
        tabbingIdentifier: config.tabbingIdentifier ?? undefined,
        acceptFirstMouse: config.acceptFirstMouse,
        webPreferences: {
            preload: path.join(__dirname, 'custom.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            devTools: config.devtools,
            backgroundThrottling: config.backgroundThrottling ?? undefined,
            // javascript: config.javascriptDisabled ? false : undefined,
            sandbox: true,
            partition,
        },
        show: false,
        backgroundColor: config.backgroundColor ?? '#ffffff',
    })

    // mainWindow.setContentProtection(config.contentProtected)

    // 强制使用配置里的标题，阻止网页标题覆盖
    const appTitle = config.title
    if (appTitle) {
        mainWindow.setTitle(appTitle)
    }

    // if pageTitle is true, prevent the page title from being updated
    mainWindow.on('page-title-updated', (event) => {
        event.preventDefault()
        if (appTitle && config.pageTitle) {
            mainWindow?.setTitle(appTitle)
        }
    })

    // 最小/最大尺寸：某些平台下用 setXXX 更稳定
    if (config.minWidth > 0 && config.minHeight > 0) {
        mainWindow.setMinimumSize(config.minWidth, config.minHeight)
    }
    if (config.maxWidth > 0 && config.maxHeight > 0) {
        mainWindow.setMaximumSize(config.maxWidth, config.maxHeight)
    }

    // userAgent 必须在 loadURL 前设置
    if (config.userAgent) {
        mainWindow.webContents.setUserAgent(config.userAgent)
    }

    // 代理（如有）
    if (config.proxyUrl) {
        await mainWindow.webContents.session.setProxy({
            proxyRules: config.proxyUrl,
        })
    }

    // if isHtml is true, load the html file
    if (config.isHtml) {
        const htmlPath = path.join(__dirname, '../src', 'index.html')
        mainWindow.loadFile(htmlPath)
    } else {
        mainWindow.loadURL(WEBSITE_URL)
    }

    // open devtools (仅当配置开启时)
    if (config.debug) {
        mainWindow.webContents.openDevTools()
    }

    // 关闭主窗口时先关闭 DevTools，否则 DevTools 窗口会阻止 window-all-closed 触发，导致应用无法退出、Dock/任务栏图标残留
    mainWindow.on('close', () => {
        mainWindow?.webContents?.closeDevTools()
    })

    mainWindow.once('ready-to-show', () => {
        if (config.maximized) {
            mainWindow?.maximize()
        }
        if (config.fullscreen) {
            mainWindow?.setFullScreen(true)
        }

        if (config.visible) {
            mainWindow?.show()
            if (config.focus) {
                mainWindow?.focus()
            }
        }

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

// creat the menu
function createMenu() {
    const template = [
        {
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

// when the application is ready, create the window and the menu
app.whenReady().then(() => {
    createMenu()

    // create the window
    createWindow()
    // when the application is activated, create the window
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// when all windows are closed, quit the application（所有平台关窗后都退出，避免 Dock/任务栏图标残留）
app.on('window-all-closed', () => {
    app.quit()
})

// when a certificate error occurs, prevent it from being displayed
app.on(
    'certificate-error',
    (event, webContents, url, error, certificate, callback) => {
        event.preventDefault()
        callback(true)
    }
)
