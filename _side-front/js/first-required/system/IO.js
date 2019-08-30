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

}
