'use strict'
/** ---------------------------------------------------------------------
  *   Class PPage
    -----------
    Gestion des pages

Entendu que l'affichage d'un texte, quel que soit sa longueur,
se fait par page, pour accélérer tous les processus.

*** --------------------------------------------------------------------- */

class PPage {
  static get PAGE_DEFAULT_LENGTH(){return 1500}
  /**
    Découpe le texte +str+ en pages (instances PPage)
    Si +owner+ est défini, c'est le PTexte concerné et on met les pages
    dans sa propriétés `pages`. Sinon, on les conserve ici dans
    this.items(/PPage.items) (array)
  **/
  static split(str, owner){
    var pages = []
      , pageNumber = 0
      , portion

    while(str.length){
      if (str.length < PTexte.PAGE_LENGTH){
        // <= Il reste moins de caractères que pour une page
        // => On en fait la dernière page et on s'arrête
        portion = str
        str = ''
      } else {
        // On cherche le premier espace autour de 1500 pages
        portion = str.substring(0, PTexte.PAGE_LENGTH)
        var lastIndex = Math.max(
            portion.lastIndexOf(' ')
          , portion.lastIndexOf(CR)
        )
        var portion = str.substring(0,lastIndex)
        str = str.substring(lastIndex, str.length)
      }
      ++pageNumber
      pages.push(new PPage(portion, pageNumber))
    }//Fin de boucle pour découper le texte

    if ( owner ) {
      owner.pages = pages
    } else {
      this.items = pages
    }
    console.log('Pages instanciées : ', pages)
    pages = null
  }

  static async edit(ppage){
    // Pour le moment, on réinitialise chaque fois un éditeur (parce que je
    // ne sait pas utiliser `render` de editorjs)
    delete this.editor
    // Pour editorjs
    // Note : comme je ne sais pas utiliser <editorjs>.blocks.render, je dois

    // On peut maintenant initier l'éditer
    this.editor = new NMEditorJS({
        // holderId:'working-editor'
        holder:'working-editor'
      , data:{time:(new Date().getTime()), blocks:ppage.blocks}
      , onChange: ppage.onChange.bind(ppage)
    })
    await this.editor.isReady;
    this.editor.save(ppage.forSave.bind(ppage, true))

  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(str, number){
    this.originalText = str
    this.number = number
  }

  edit(){
    console.log("Je dois éditer la page numéro", this.number)
    // Mettre le texte dans l'éditeur
    PPage.edit(this)
    // Mettre le numéro de page
    DGet('#page-number').innerHTML = this.number
    // Mettre la longueur du texte
    DGet('#text-length').innerHTML = this.originalText.length
  }

  forSave(initial, data){
    console.log("Data du texte renvoyées par le save de editorjs", data)
    if ( initial ){
      console.log("C'est le premier appel")
      this.initialData = data
    } else {
      // C'est une modification
    }
  }

  /**
    Appelé lorsqu'un paragraphe a été modifié
  **/
  onChange(){
    console.log("Un paragraphe a été changé")
    // TODO Passer en revue les paragraphes de la page pour le trouver
  }

  /**
    Retourne le texte de la page sous la forme de blocks prêts pour editorjs
  **/
  get blocks(){
    return this._blocks || ( this._blocks = this.text2blocks() )
  }

  /**
    Transforme le texte original de la page en données Block pour editorjs
  **/
  text2blocks(){
    var blocks = []
    var index  = -1
    this.originalText.split(CR).forEach(parag => {
      var html = md2html(parag)
      var raw  = html.replace(/<(.*?)>/g,'')
      // var raw  = html.replace(/<([^>]*)>/g,'')
      blocks.push({
          type:'paragraph'
        , index: ++index
        , data:{
              text:     html
            , original: parag
            , raw:      raw
          }
      })
    })
    return blocks
  }
}
