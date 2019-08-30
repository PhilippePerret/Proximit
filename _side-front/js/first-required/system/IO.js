'use strict'
/**
  Pour les paths et les entrées sorties
**/

const IO = {
  name: 'IO'

, saveSync(fpath, value) {
    return fs.writeFileSync(fpath, value)
  }

, loadSync(fpath) {
    return fs.readFileSync(fpath, 'utf-8')
  }
  // Pour obtenir le path absolu d'un élement de l'application
, pathOf(relpath){return path.join(this.appFolder, relpath)}

, get appFolder(){
    return this._appfolder || (this._appfolder = remote.app.getAppPath())
  }

  /**
    Méthode qui permet de choisir un fichier, un dossier, etc. en fonction
    des paramètres +params+ transmis.

    params:
      message: Le message d'action sur la fenêtre
      folder:   true/false    Si true, on peut choisir un dossier
      create:   true/false    Si true, on peut créer un dossier
      file:     true/false    Si true, on peut choisir un fichier
      multi:    true/false    Si true, on peut en choisir plusieurs
      defaultPath:  Le chemin d'accès par défaut (le gérer dans l'application)
      button:   Le nom du bouton de choix

      Par défaut :
        - Le message est "Choisir…"
        - on demande un fichier, pas un dossier
        - on peut créer un dossier

  **/
, choose(params){
    params = params || {}
    var props = []
    if ( !params.folder && !params.file ) params.file = true
    params.folder && props.push('openDirectory')
    params.file   && props.push('openFile')
    params.create === false || props.push('createDirectory')

    let openOptions = {
        message:      params.message || "Choisir…"
      , properties:   props
      , buttonLabel:  params.button || "Ouvrir"
    }

    if ( params.file ) {
      params.extensions || (params.extensions = [{name:'Tous les fichiers', extensions:['txt']}])
      Object.assign(openOptions,{filters: params.extensions})
    }

    params.defaultPath && Object.assign(openOptions,{defaultPath:params.defaultPath})

    // On présente la fenêtre à l'utilisateur
    let files = Dialog.showOpenDialogSync(openOptions)
    // console.log("files: ", files)
    if (!files) return false
    return files
  }

}
