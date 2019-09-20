'use strict'

const rmrf = require('rimraf')

Object.assign(TESTS,{
  /**
    Ouvre un texte (et vérifie qu'il a bien été chargé)
    Le texte doit se trouver dans './spec/support/assets/textes/'
    @async => utiliser "await TESTS.openTexte("...")"

    @param {String} text_name Le nom du fichier dans le dossier
                              ./spec/support/assets/textes/
    @param {Hash} options
                  :reset    Si true, on doit détruire le dossier _prox
                  :analyze  Si true, on doit procéder à l'analyse du texte après
                            son ouverture.
  **/
  async openTexte(text_name, options){
    options = options || {}
    let path_texte = TESTS.pathOfTexte(text_name)
    if ( options.reset ) {
      // S'il faut tout réinitialiser, on détruit le dossier _prox du texte
      let proxfolder = this.pathFolderTexte(path_texte)
      if ( fs.existsSync(proxfolder) ) await this.eraseProxFolder(proxfolder)
    }
    // On attend que le chargement soit terminé (par exemple pour une ouverture
    // demandée dès le lancement)
    await TESTS.waitFor(() => App.loading === false)
    await PTexte.open(path_texte)
    if ( options.analyze ) {
      await this.analyzeTexte()
    }
    await TESTS.waitFor( () => PTexte.current.loading === false )
    assert(PTexte.current.name == text_name, `Le nom du texte courant est bien "${text_name}".`, `Le nom du texte courant devrait être "${text_name}", or, c'est "${PTexte.current.name}".`)
  }

, eraseProxFolder(proxfolder){
    return new Promise((ok,ko)=>{
      rmrf(proxfolder, [], ok)
    })
  }
, analyzeTexte(){
    return new Promise((ok,ko)=>{
      PTexte.analyseCurrent(ok)
    })
  }
, pathFolderTexte(textpath){
    const dir = path.dirname(textpath)
    const aff = path.basename(textpath,path.extname(textpath))
    return path.join(dir,`${aff}_prox`)
  }
})
