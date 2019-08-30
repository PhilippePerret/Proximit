'use strict'

let PTexte = require('./PTexte')

/**
  |
  | Exécute un script JS sur le renderer
  |
  | mainW doit avoir été défini dans app.js, comme constante globale, et
  | c'est la fenêtre ouverte.
**/
function execJS(methodAndArgs){
  mainW.webContents.executeJavaScript(methodAndArgs)
}

const ObjMenus = {

  get data_menus(){
    return [
      {
        label: 'Fichier'
      , enabled: true
      , submenu: [
          {
              label: 'Choisir le texte…'
            , accelerator: 'CmdOrCtrl+O'
            , enabled: true
            , click:function(){execJS("PTexte.open()")}
          }
        , { type:'separator' }
        , { role: 'quit' }
        ]
      }
    , {
        label: 'Analyse'
      , enabled: true
      , id: 'menu-analyse'
      , submenu: [
          {
              label: 'Analyser le texte'
            , id: 'analyse-analyser'
            , accelerator: 'CmdOrCtrl+A'
            , enabled: true // Plus tard, dépendra de présence de texte ou non
            , click:function(){
                execJS("IO.choose()")
              }
          }
        ]
      }
    , {
        label: 'Outils'
      , enabled: true
      , submenu: [
          {
              label: 'Recharger l’application'
            , accelerator: 'CmdOrCtrl+R'
            , click: () => {mainW.reload()}
          }
          , {type:'separator'}
          , {label: 'Console web', role:'toggleDevTools'}
        ]
      }

    ]
  }
}

module.exports = ObjMenus
