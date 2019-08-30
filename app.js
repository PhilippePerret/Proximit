'use strict'

// // ?
// require('update-electron-app')({
//   logger: require('electron-log')
// })

const path = require('path')
const glob = require('glob')
const {app, BrowserWindow} = require('electron')
const { Menu, MenuItem } = require('electron')

// Mode débug ?
const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Electron APIs')

// La fenêtre principale
let mainWindow = null

global.ObjMenus = require('./_side-back/js/menus')


// Fonction appelée en bas de ce module, pour initialiser l'application
function initialize () {

  // Création d'une instance unique
  makeSingleInstance()

  // Chargement de tous les fichiers javascript utiles au
  // processus principal
  loadMainProcessFiles()

  // Construction des menus
  // Note : on a besoin de `mainMenuBar` pour retrouver les menus par
  // leur identifiant (cf. le modules modules/menus.js)
  ObjMenus.mainMenuBar = Menu.buildFromTemplate(ObjMenus.data_menus)
  Menu.setApplicationMenu(ObjMenus.mainMenuBar)


  // On doit créer le fichier main.html
  // Utiliser "npm run start-update" pour actualiser le fichier
  if ( process.env.UPDATE_MAIN_HTML ) {
    console.log("Actualisation du fichier main.html…")
    MainBuild.build()
    console.log("Fichier main.html actualisé")
  }


  // Création de la fenêtre
  function createWindow () {
    const windowOptions = {
        width: 1520
      , minWidth: 680
      , height: 840
      , icon: __dirname+'/Imagerie/Icone/Icone-1024x1024.icns'
      , title: app.getName()
      , webPreferences: {
          nodeIntegration: true
        }
    }

    // // Si on est sur Linux
    // if (process.platform === 'linux') {
    //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    // }

    // On ouvre la fenêtre principale…
    mainWindow = new BrowserWindow(windowOptions)
    // Et on charge dedans le fichier principal

    // Chargement d'un fichier html
    mainWindow.loadURL(path.join('file://', __dirname, '/_side-front/main.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    // Quand on ferme la fenêtre, on détruit l'instance
    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  /**
    Quand l'application est prête, on créer la fenêtre
  **/
  app.on('ready', () => {
    createWindow()
  })

  /**
    Si toutes les fenêtres sont fermées, et qu'on n'est pas sur mac,
    on quitte l'application.
  **/
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  /**
    Quand on active l'application, on ne recrée une nouvelle instance
    de fenêtre que si elle a été détruite (sur mac, donc)
  **/
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}// /initialize

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadMainProcessFiles () {
  const files = glob.sync(path.join(__dirname, '_side-back/js/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize()
