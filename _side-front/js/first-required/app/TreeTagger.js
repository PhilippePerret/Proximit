'use strict'
/** ---------------------------------------------------------------------
  *   TreeTagger
  *
*** --------------------------------------------------------------------- */
const TREETAGGER = require('treetagger')

function treeTag(str){
  TreeTagger.analyze(str)
}
const TreeTagger = {
  analyze(str, callback){
    console.log("-> TreeTagger.analyze")
    const my = this
    Bench.start('Treetagger')
    this.tagger.tag(str, (err, results) => {
      console.log("-> retour de tagger.tag")
      if (err) console.error(err)
      Bench.stop('Treetagger')
      // console.log("Résultat :", results)
      if (callback) callback(results)
    })
    console.log("<- TreeTagger.analyze (asynchrone)")
  }
}
Object.defineProperties(TreeTagger,{
  tagger:{get(){
    return this._tagger || (this._tagger = new TREETAGGER({language:'french', encoding:'utf8'}))
  }}
})
