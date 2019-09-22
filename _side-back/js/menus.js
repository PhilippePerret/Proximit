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
            , id: 'choose-ptexte'
            , accelerator: 'CmdOrCtrl+O'
            , enabled: true
            , click:function(){execJS("PTexte.chooseText.call(PTexte)")}
          }
        , {
              label:'Recharger'
            , id: 'reload-ptexte'
            , accelerator: 'CmdOrCtrl+Shift+R'
            , click:function(){execJS('PTexte.reloadCurrent.call(PTexte)')}
          }
        , { type:'separator' }
        , {
              label:'Reset…'
            , id: 'reset-ptexte'
            , click:function(){execJS('PTexte.resetCurrent.call(PTexte)')}
          }
        , { type:'separator' }
        , {
                label: 'Sauver'
              , id: 'save-ptexte'
              , accelerator: 'CmdOrCtrl+S'
              , enabled: true
              , click:function(){execJS("PTexte.saveCurrent.call(PTexte)")}
          }
        , { type:'separator' }
        , { role: 'quit' }
        ]
      }
    , {
        label: 'Édition'
      , enabled: true
      , submenu: [
            {role:'cancel', label:'Annuler'}
          , {rold:'redo', label:'Refaire'}
          , {type: 'separator'}
          , {role:'copy', label:'Copier'}
          , {role:'cut', label:'Couper'}
          , {role:'paste', label:'Coller'}
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
        , {type:'separator'}
        , {
              label: 'Nouvelle version…'
            , id: 'texte-new-version'
            , enabled:true // à régler plus tard
            , click:function(){execJS('PTexte.current.newVersion.call(PTexte.current)')}
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
