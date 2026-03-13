import { contextBridge } from 'electron'

declare global {
    interface Window {
        electronAPI: {
            platform: NodeJS.Platform
            versions: {
                node: string
                chrome: string
                electron: string
            }
        }
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },
})

window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script loaded')
})
