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
  analyze(str){
    const my = this
    Bench.start('Treetagger')
    this.tagger.tag(str, (err, results) => {
      if (err) console.error(err)
      Bench.stop('Treetagger')
      console.log("Résultat :", results)
    })
  }
}
Object.defineProperties(TreeTagger,{
  tagger:{get(){
    return this._tagger || (this._tagger = new TREETAGGER({language:'french'}))
  }}
})
