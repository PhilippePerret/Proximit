'use strict'
/** ---------------------------------------------------------------------
  *   Converter
  *
  * Pour convertir des textes d'un format vers un autre
*** --------------------------------------------------------------------- */
const Showdown  = require('showdown') // converter markdown => html

function md2html(str, options){
  return Converter.md2html(str, options)
}
function html2md(str, options){
  return Converter.html2md(str, options)
}

function editorjs2text(blocks, options){
  return Converter.editorjs2text(blocks, options)
}

class Converter {
  static md2html(str, options){
    return this.mdconverter.makeHtml(str)
  }
  static html2md(str, options){
    if ('function'==typeof this.mdconverter.makeMarkdown){
      return this.mdconverter.makeMarkdown(str)
    } else {
      console.error("Pas de méthode makeMarkdown")
      return str
    }
  }
  static editorjs2text(blocks, options){
    var tf = []
    blocks.forEach(block => {tf.push(html2md(block.data.text))})
    return tf.join(CR)
  }
  static get mdconverter(){
    return this._mdconverter || (this._mdconverter = new Showdown.Converter())
  }
}
