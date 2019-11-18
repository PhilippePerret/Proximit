'use strict'
/**
  Ce module reprend les méthodes qui sont utilisées pour analyser l'intégralité
  du texte. Elles ne sont plus utilisées dans le programme actuel qui fonctionne
  page par page.
**/
const ModPTexte = {
  /**

    Méthode principale, appelée par le menu "Analyse > Analyser" qui
    lance la procédure d'analyse du texte courant.
    Pour le moment, elle demande à choisir le texte s'il n'y a pas de texte
    courant mais plus tard, le menu sera désactivé
  **/
  async analyseCurrent(callback){
    const my = this
    if ( undefined === my.current ) my.chooseText()
    if ( undefined === my.current ) return ; // annulation
    my.current.analyzed = null
    // Si ce texte a déjà été enregistré, il faut confirmer deux fois
    // la destruction des corrections
    if ( my.current.hasBeenModified ) {
      ask("Ce texte a déjà été corrigé à l'aide de Proximit.\nSi vous relancez son analyse, TOUTES LES MODIFICATIONS SERONT DÉFINITIVEMENT PERDUES.\n\nVoulez-vous vraiment perdre toutes les modifications ?",{
        buttons:[
            {text:'Renoncer',onclick:function(){UI.message('Analyse abandonnée.')}}
          , {text:'Recommencer l’analyse', onclick:this.proceedAnalyseCurrent.bind(this,callback)}
        ]
      })
    } else {
      this.proceedAnalyseCurrent(callback)
    }
  }
, proceedAnalyseCurrent(callback){
    const my = this
    UI.clean()
    UI.waiter("Analyse du texte.\nMerci de patienter…", UI.taggedPagesSection.domObj)
    execFile(`./bin/analyse_texte.rb`, [PTexte.current.path], (err, stdout, stderr) => {
      UI.stopWaiter()
      if (err) {
        my.current.analyzed = false
        log.error(err)
        throw(err)
      } else {
        my.open(my.current.path)
        if ('function' === typeof callback) callback.call()
      }
    })
  }

}
module.exports = ModPTexte
