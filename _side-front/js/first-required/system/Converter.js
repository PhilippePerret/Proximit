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
function html2raw(str, options){
  return Converter.html2raw(str,options)
}

function editorjs2text(blocks, options){
  return Converter.editorjs2text(blocks, options)
}

class Converter {
  static md2html(str, options){
    return this.mdconverter.makeHtml(str)
  }
  static html2md(str, options){
    str = this.replaceHTMLEntities(str)
    return this.mdconverter.makeMarkdown(str)
  }
  static html2raw(html, options){
    html = this.replaceHTMLEntities(html)
    return html.replace(/<([^>]*)>/g,'')
  }

  static get HTML_ENTITIES(){
    return this._htmlentities || (this._htmlentities = {
      'nbsp': ' '
    });
  }
  static replaceHTMLEntities(html){
    // Si les regexp des entités html ne sont pas prêtes, on les prépare
    // la première fois.
    this.RegExpHTMLEntities || this.defineRegExpHTMLEntities()
    for(var dreg of this.RegExpHTMLEntities){
      html = html.replace(dreg.regEntity,dreg.replacement)
    }
    return html
  }
  static editorjs2text(blocks, options){
    var tf = []
    blocks.forEach(block => {tf.push(html2md(block.data.text))})
    return tf.join(CR)
  }
  static get mdconverter(){
    return this._mdconverter || (this._mdconverter = new Showdown.Converter())
  }
  static get RegExpHTMLEntities(){return this._RegExpHTMLEntities}
  static defineRegExpHTMLEntities(){
    var h = []
    for(var entity in this.HTML_ENTITIES){
      h.push({
          regEntity: new RegExp(`\\&${entity}\\;`,'g')
        , replacement: this.HTML_ENTITIES[entity]
      })
    }
    console.log("Converter._RegExpHTMLEntities = ", h)
    this._RegExpHTMLEntities = h
  }
}
