const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const config = require('./config.json')

const WEBSITE_URL = config.url

let mainWindow = null

// window state save file path, save to user data directory, avoid polluting the project directory
const windowStatePath = path.join(app.getPath('userData'), 'app_data.json')

// load the window state
function loadWindowState() {
    try {
        // if the file exists and the state is true, load the state
        if (fs.existsSync(windowStatePath) && config.state) {
            const raw = fs.readFileSync(windowStatePath, 'utf-8')
            const state = JSON.parse(raw)
            if (
                typeof state.width === 'number' &&
                typeof state.height === 'number'
            ) {
                return state
            }
        }
    } catch (e) {
        // ignore parse errors, fallback to config
    }
    return null
}

// save the window state
function saveWindowState(browserWindow) {
    if (!browserWindow || browserWindow.isDestroyed()) return
    try {
        const bounds = browserWindow.getBounds()
        const isMaximized = browserWindow.isMaximized()
        const isFullScreen = browserWindow.isFullScreen()
        const state = {
            ...bounds,
            isMaximized,
            isFullScreen,
        }
        fs.writeFileSync(
            windowStatePath,
            JSON.stringify(state, null, 2),
            'utf-8'
        )
    } catch (e) {
        // ignore write errors
    }
}

// create the window
async function createWindow() {
    // create the window
    const partition = config.incognito ? 'temp' : undefined

    // load the window state
    const savedState = loadWindowState()

    mainWindow = new BrowserWindow({
        width: savedState?.width ?? config.width,
        height: savedState?.height ?? config.height,
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
        x: savedState?.x,
        y: savedState?.y,
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
    // 在关闭前保存窗口状态
    mainWindow.on('close', () => {
        saveWindowState(mainWindow)
        mainWindow?.webContents?.closeDevTools()
    })

    mainWindow.once('ready-to-show', () => {
        // 如果上次是最大化/全屏，则优先恢复上次状态，否则使用配置
        if (savedState?.isMaximized) {
            mainWindow?.maximize()
        } else if (config.maximized) {
            mainWindow?.maximize()
        }
        if (savedState?.isFullScreen || config.fullscreen) {
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

// creat the menu, only for macOS
function createMenu() {
    if (process.platform !== 'darwin') {
        // Windows / Linux don't show the menu
        Menu.setApplicationMenu(null)
        return
    }
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
    // create the menu
    createMenu()

    // create the window
    createWindow()
})

// when all windows are closed, quit the application
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
