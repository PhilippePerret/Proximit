'use strict'
/** ---------------------------------------------------------------------
  *   Classe PParagraph
  *   -----------------
  *   Gestion des paragraphes
*** --------------------------------------------------------------------- */
class PParagraph {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne l'instance d'identifiant +paragId+

    @param {String} paragId   Identifiant du paragraphe constituté du numéro
                              de page et de son index au départ de la session
  **/
  static get(paragId){
    return this.items[paragId]
  }

  /**
    Ajoute un paragraphe à la liste des items
  **/
  static add(pparag){
    if (undefined === this.items ) this.items = {}
    Object.assign(this.items, {[pparag.id]: pparag})
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  /**
    Instanciation
    -------------
    Pour le moment (pour l'essai), on la fait à partir du code HTML taggué
    mais ensuite on la fera avec le texte original et un identifiant.

    @param {PPage}  page     La page à laquelle appartient le paragraphe
    @param {Object} data    Données du paragraphe qui peuvent varier suivant
                            lieu de l'instanciation
                            L'instanciation se fait avec le texte Markdown et
                            l'index dans la page.
  **/
  constructor(page, data){
    this.page   = page
    this._md    = data.md
    this.index  = data.index
    PParagraph.add(this)
  }

  onChange(){

  }

  /**
    Actualise la version tagguée du paragraphe dans la page tagguée
  **/
  update(taggedCode){
    this.taggedCode = taggedCode
    if (this.taggedObj) {
      // <= L'objet taggué a déjà été construit dans la page
      // => On le remplace par le nouveau code
      this.taggedobj.replaceWith(this.taggedCode)
    } else {
      // <= L'objet taggué n'a pas encore été construit
      // => On le crée
      this.page.taggedPage.append(this.buildTagged())
    }
  }

  buildTagged(){
    return DCreate('DIV',{id:this.taggedDomId, 'data-id':this.id, class:'tagged-par',inner:[this.taggedCode]})
  }

  get taggedObj(){
    return this.taggedobj || ( this.taggedobj = DGet(`#${this.taggedDomId}`) )
  }

  /**
    Le texte du paragraphe en version Markdown
    (donné à l'instanciation)
  **/
  get md(){
    return this._md
  }

  /**
    Le texte en version html
  **/
  get html(){
    return this._html || (this._html = md2html(this.md))
  }

  /**
    Le texte en version brut
  **/
  get raw(){
    return this._raw || (this._raw = html2raw(this.html))
  }

  /**
    Numéro de la page
  **/
  get pageNumero(){
    return this._pagenumero || ( this._pagenumero = this.page.numero )
  }

  /**
    Id du DIV du paragraphe dans la page normale
  **/
  get domId(){
    return this._domid || (this._domid = `parag-${this.id}`)
  }

  /**
    ID du DIV du paragraphe dans la page tagguée
  **/
  get taggedDomId(){
    return this._tagdomid || (this._tagdomid = `parag-tagged-${this.id}`)
  }

  /**
    Identifiant du paragraphe
  **/
  get id(){
    return this._id || (this._id = `${this.page.numero}_${this.index}`)
  }
}
