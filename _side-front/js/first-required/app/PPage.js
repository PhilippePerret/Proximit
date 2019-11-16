'use strict'
/** ---------------------------------------------------------------------
  *   Class PPage
    -----------
    Gestion des pages

Entendu que l'affichage d'un texte, quel que soit sa longueur,
se fait par page, pour accélérer tous les processus.

*** --------------------------------------------------------------------- */

class PPage {
  static get PAGE_LENGTH(){return 1500}
  /**
    Découpe le texte +str+ en pages (instances PPage) et les conserve
    dans this.items(/PPage.items) (array)
  **/
  static split(str){
    this.items = []
    var pageNumber = 0
    var portion
    while(str.length){
      if (str.length < this.PAGE_LENGTH){
        // <= Il reste moins de caractères que pour une page
        // => On en fait la dernière page et on s'arrête
        portion = str
        str = ''
      } else {
        // On cherche le premier espace autour de 1500 pages
        portion = str.substring(0, 1500)
        var lastIndex = Math.max(
            portion.lastIndexOf(' ')
          , portion.lastIndexOf(CR)
        )
        var portion = str.substring(0,lastIndex)
        str = str.substring(lastIndex, str.length)
      }
      ++pageNumber
      this.items.push(new PPage(portion, pageNumber))
    }//Fin de boucle pour découper le texte

    console.log('Pages instanciées : ', this.items)
  }

  static async edit(ppage){
    // Pour le moment, on réinitialise chaque fois un éditeur
    delete this.editor
    // Pour editorjs
    // Note : comme je ne sais pas utiliser <editorjs>.blocks.render, je dois
    // construire d'abord la donnée pour l'instanciation puis instancier
    // l'éditeur pour ce texte.
    var blocks = []
    ppage.originalText.split(CR).forEach(parag => {
      parag = md2html(parag)
      blocks.push({type:'paragraph',data:{text:parag}})
    })

    // On peut maintenant initier l'éditer
    this.editor = new NMEditorJS({
        // holderId:'working-editor'
        holder:'working-editor'
      , data:{time:(new Date().getTime()), blocks:blocks}
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

  }
}
