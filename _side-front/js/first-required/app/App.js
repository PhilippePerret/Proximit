'use strict'

const App = {

  async init(){
    console.log("-> App.init")
    UI.init()
    Prefs.load()
    // $.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );
    if ( Prefs.get('load_last_on_start') ) {
      PTexte.open(Prefs.get('path_texte'))
    }
    console.log("<- App.init")
  }

, unBouton(){
    alert("Vous pouvez utiliser ce bouton pour lancer une opération.")
  }
}
