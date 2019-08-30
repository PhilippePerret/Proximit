'use strict'


const ObjMenus = {

  get data_menus(){
    return [
      {
          label: 'Fichier'
        , enabled: true
        , submenu: [
            {
                label: 'Ouvrir…'
              , id: 'file-open'
              , role: 'open'
              , enabled: true
            }
            , {
              role: 'quit'
            }
          ]
      }
    ]
  }
}

module.exports = ObjMenus
