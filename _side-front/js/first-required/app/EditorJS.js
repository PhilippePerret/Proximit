'use strict'
/** ---------------------------------------------------------------------
  *   Mes méthodes pour l'éditeur
  *
*** --------------------------------------------------------------------- */
const NMEditorJS  = require('@editorjs/editorjs')
const Paragraph  = require('@editorjs/paragraph')


class MyParagraph extends Paragraph {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
    * Pour la classe Paragraph, cf. :
    * https://github.com/editor-js/paragraph/blob/master/src/index.js
  *** --------------------------------------------------------------------- */
  static get current(){return this._current}
  static set current(v){this._current = v}
  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(args){
    super(args)
    // var {data,api,config} = args
    this.data   = args.data
    this.api    = args.api
    this.config = args.config
    // console.log("Données du paragraphe : ", data)
  }
  // render(){
  //   this.div = document.createElement('DIV')
  //   this.div.innerHTML = this.html
  //   this.div.className = 'ce-paragraph cdx-block'
  //   console.log("div : ", this.div)
  //   // TODO Surveiller le div en cas de modification
  //   return this.div
  // }
  render(){
    const my = this
    this._element.addEventListener('focus', (ev) => {
      // console.log("Focus dans le paragraphe #%d", this.id)
      MyParagraph.current = my
    })
    this._element.addEventListener('blur', (ev) => {
      // console.log("Blur du paragraphe #%d", this.id)
      MyParagraph.current = null
    })
    this._element.setAttribute('data-id', this.id)
    return this._element
  }
  save(toolsContent){
    if(undefined === toolsContent) toolsContent = this._element
    console.log(">>> html au départ : '%s'",toolsContent.innerHTML)
    this.html = Converter.replaceHTMLEntities(toolsContent.innerHTML)
    console.log('<<< html après conversion : "%s"', this.html)
    return {
          html: this.html
        , raw:  this.raw
        , md:   this.md
        , text: this.md // garder pour editorjs
        , id:   this.id
      }
  }
  // get default(){return this.html}
  get html(){return this._html || (this._html = md2html(this.md))}
  set html(v){
    this._html = v
    this._raw = html2raw(v)
    this._md  = html2md(v)
  }
  get raw(){return this._raw || (this._raw = html2raw(this.html))}
  get md(){return this._md || (this._md = this.data.md_original||this.data.md)}

  /**
    Page (instance {PPage}) du paragraphe
  **/
  get page(){
    return this._page || ( this._page = this.data.page )
  }

  /**
    Index du paragraphe
  **/
  get index(){
    return this._index || ( this._index = this.data.index )
  }

  /**
    Identifiant absolu du paragraphe
  **/
  get id(){
    return this._id || (this._id = `${this.page.numero}_${this.index}`)
  }
}

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
