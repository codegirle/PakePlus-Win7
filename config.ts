export interface AppConfig {
    label: string
    title: string
    url: string
    userAgent: string
    width: number
    height: number
    theme: string | null
    resizable: boolean
    fullscreen: boolean
    maximized: boolean
    minWidth: number
    minHeight: number
    maxWidth: number
    maxHeight: number
    decorations: boolean
    transparent: boolean
    titleBarStyle: string
    visible: boolean
    focus: boolean
    closable: boolean
    minimizable: boolean
    maximizable: boolean
    alwaysOnTop: boolean
    alwaysOnBottom: boolean
    center: boolean
    shadow: boolean
    skipTaskbar: boolean
    tabbingIdentifier: string | null
    parent: unknown | null
    dragDropEnabled: boolean
    browserExtensionsEnabled: boolean
    devtools: boolean
    contentProtected: boolean
    hiddenTitle: boolean
    incognito: boolean
    proxyUrl: string | null
    useHttpsScheme: boolean
    zoomHotkeysEnabled: boolean
    acceptFirstMouse: boolean
    create: boolean
    backgroundColor: string | null
    backgroundThrottling: boolean | null
    javascriptDisabled: boolean
    openDevTools: boolean
    appTitle: string
}

const config: AppConfig = {
    label: '',
    title: '',
    url: 'https://juejin.cn/',
    userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    width: 800,
    height: 600,
    theme: null,
    resizable: true,
    fullscreen: false,
    maximized: false,
    minWidth: 400,
    minHeight: 300,
    maxWidth: 1920,
    maxHeight: 1080,
    decorations: true,
    transparent: false,
    titleBarStyle: 'Visible',
    visible: true,
    focus: true,
    closable: true,
    minimizable: true,
    maximizable: true,
    alwaysOnTop: false,
    alwaysOnBottom: false,
    center: false,
    shadow: true,
    skipTaskbar: false,
    tabbingIdentifier: null,
    parent: null,
    dragDropEnabled: true,
    browserExtensionsEnabled: false,
    devtools: true,
    contentProtected: false,
    hiddenTitle: false,
    incognito: false,
    proxyUrl: null,
    useHttpsScheme: false,
    zoomHotkeysEnabled: false,
    acceptFirstMouse: false,
    create: false,
    backgroundColor: null,
    backgroundThrottling: null,
    javascriptDisabled: false,
    openDevTools: false,
    appTitle: 'PakePlus-Win7',
}

export default config
