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

    // // Code à essayer
    // await TexteAnalyse.analyze("Un texte à analyser dans le texte.")
    // TexteAnalyse.tag()

    // J'essaie de lancer la boucle sur le texte
    this.watchTexte()

    log.info("<- App.init")
  }

, watchTexte(){
    this.timerWatchTexte = setInterval(this.checkText.bind(this), 5*1000)
  }
, async checkText(){
    await TexteAnalyse.analyze(UI.workingField.value)
    TexteAnalyse.tag()
  }
, stopWatchingTexte(){
    clearInterval(this.timerWatchTexte)
    delete this.timerWatchTexte
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
