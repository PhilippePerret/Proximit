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
    App.editor = new this('working-editor')
    if (PTexte.current && PTexte.current.textLoaded === false){
      PTexte.current.editWorkingTexte()
    }
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
    this.editor = new NMEditorJS({holder:this.id})
  }

  feedWithMDText(str){
    // Il faut commencer par découper le texte en paragraphes
    // NON : en fait, on essaie simplement de copier le texte dans l'éditeur

    // Il faut transformer les mises en forme Markdown


    this.feedWithHTMLText(this.MDConverter.makeHtml(str))

  }

  feedWithHTMLText(html){
    DGet(`#${this.id}`).innerHTML = html
  }

  feedWithData(data){
    this.editor.data = data
  }

  get MDConverter(){
    return this._mdconverter || (this._mdconverter = new Showdown.Converter())
  }

}
