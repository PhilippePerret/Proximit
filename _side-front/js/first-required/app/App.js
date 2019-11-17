'use strict'

const App = {

  async init(){
    log.info("-> App.init")
    this.loading = true
    UI.init.call(UI)
    UI.initApp.call(UI)

    // On instancie l'éditeur (this.editor/App.editor)
    EditorJS.init()

    Prefs.load()
    // $.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );
    if ( Prefs.get('load_last_on_start') ) {
      await PTexte.open(Prefs.get('path_texte'))
    }
    this.loading = false

    log.info("<- App.init")
  }

  /**
    Permet de charger des données YAML se trouvant dans le dossier `./data`

    Les fichiers doivent obligatoirement se terminer par `.yaml` (pas `.yml`)
  **/
, getYAMLData(relaffixe){
    var pth = path.join(this.folder,'data',`${relaffixe}.yaml`)
    return YAML.parse(fs.readFileSync(pth,'utf8'))
  }

, watchTexte(){
    this.lastCheckTime = -1
    this.timerWatchTexte = setInterval(this.checkText.bind(this), 5*1000)
  }

, async checkText(callback){
    // Si on est en train d'écrire, on ne fait rien
    if ( new Date().getTime() < WritingField.blockUntilTime ) {
      console.log("J'attends…")
      return
    } else if ( this.lastCheckTime > WritingField.lastKeyPressedTime) {
      console.log("Pas de modification depuis le dernier check")
      return
    } else {
      this.lastCheckTime = new Date().getTime()
      await TexteAnalyse.analyze(WritingField.getTextToCheck())
      await TexteAnalyse.tag()
      if(callback){callback.call()}
    }
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
  folder:{get(){
    return this._apppath || (this._apppath = app.getAppPath())
  }}
, ApplicationSupportFolder:{get(){
    if (undefined === this._appsupportfolder){
      this._appsupportfolder = app.getPath('userData')
    } return this._appsupportfolder
  }}
})
