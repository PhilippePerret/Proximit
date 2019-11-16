'use strict'
/** ---------------------------------------------------------------------
  *   Mes méthodes pour l'éditeur
  *
*** --------------------------------------------------------------------- */
const NMEditorJS  = require('@editorjs/editorjs')
// const Paragraph   = require('@editorjs/paragraph')



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

  get editor(){
    return this._editor || (this._editor = new NMEditorJS({holder:this.id}))
  }

  init(){

  }

  async feedWithMDText(str){
    await this.editor.isReady;

    return console.error("Rien faire pour le moment.")
    const my = this
    // Il faut commencer par découper le texte en paragraphes
    // NON : en fait, on essaie simplement de copier le texte dans l'éditeur

    // Il faut transformer les mises en forme Markdown

    console.log("Class de this.editor:", this.editor.constructor.name)
    // Pour tester
    this.editor.save((data)=>{
      console.log("Data : ", data)
    })

    // // this.feedWithHTMLText(this.MDConverter.makeHtml(str))
    // var parags = str.split(CR)
    // parags.forEach(parag => {
    //   my.editor.blocks.render([
    //     {
    //         type:'paragraph'
    //       , data:{
    //           text: parag
    //         }
    //     }
    //   ])
    // })

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
