'use strict'
/** ---------------------------------------------------------------------
  *   Mes méthodes pour l'éditeur
  *
*** --------------------------------------------------------------------- */
const NMEditorJS = require('@editorjs/editorjs')

// console.log("EditorJS = ", EditorJS)

class EditorJS {

  /**
    Initialisation de l'application
  **/
  static init(){
    this.current = new this('working-editor')

  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(id){
    this.id = id
    this.init()
  }
  init(){
    this.editor = NMEditorJS.new({holder:this.id})
  }

  feedWithMDText(str){
    // Il faut commencer par découper le texte en paragraphes
    // NON : en fait, on essaie simplement de copier le texte dans l'éditeur

    // Il faut transformer les mises en forme Markdown

    this.feedWithHTMLText(str)

  }

  feedWithHTMLText(html){
    DGet(`#${this.id}`).innerHTML = html
  }

  feedWithData(data){
    this.editor.data = data
  }

}
