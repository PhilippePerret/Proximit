'use strict'

const App = {

  async init(){
    log.info("-> App.init")
    this.loading = true
    UI.init()
    Prefs.load()
    // $.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );
    if ( Prefs.get('load_last_on_start') ) {
      await PTexte.open(Prefs.get('path_texte'))
    }
    this.loading = false
    log.info("<- App.init")
  }

, unBouton(){
    alert("Vous pouvez utiliser ce bouton pour lancer une opération.")
  }
}

Object.defineProperties(App,{
  ApplicationSupportFolder:{get(){
    if (undefined === this._appsupportfolder){
      this._appsupportfolder = app.getPath('userData')
    } return this._appsupportfolder
  }}
})
