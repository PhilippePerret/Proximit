'use strict'
/**
  | Extension de la brique 'Preferences.js'
**/

// Méthodes propres
Object.assign(Prefs,{

})
// Propriétés propres
Object.defineProperties(Prefs, {
  app_data:{get(){
    return {
        path_texte: "PTexte.current.path || null"
      , load_last_on_start: 'true'
    }
  }}
})
