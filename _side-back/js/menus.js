'use strict'

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
            , click:function(){execJS("PTexte.chooseText.call(PTexte)")}
          }
        , { type:'separator' }
        , { role: 'quit' }
        ]
      }
    , {
        label: 'Texte'
      , enabled: true
      , id: 'menu-analyse'
      , submenu: [
          {
              label: 'Analyser'
            , id: 'texte-analyser'
            , accelerator: 'CmdOrCtrl+Shift+A'
            , enabled: true // Plus tard, dépendra de présence de texte ou non
            , click:function(){
                execJS("PTexte.analyseCurrent.call(PTexte)")
              }
          }
        , {type:'separator'}
        , {
              label: 'Corriger les proximités'
            , id: 'texte-correct-proximities'
            , accelerator: 'CmdOrCtrl+Shift+P'
            , enabled: true // à corriger plus tard
            , click:function(){execJS("PTexte.current.correctProximities.call(PTexte.current)")}
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
