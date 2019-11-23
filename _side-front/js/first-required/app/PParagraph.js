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

  static reset(){
    this.newId = 0
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
  constructor(texte, data){
    this.texte = texte
    this._md   = data.md
    console.log("md = '%s', html = '%s'", this.md, this.html)
    this.index = data.index || (++PParagraph.newId)
    if ( this.index > PParagraph.newId ) PParagraph.newId = this.index
    PParagraph.add(this)

    this.onClick  = this.onClick.bind(this)
    this.onBlur   = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  log(msg){
    console.log(`%c[PParagraphe #${this.index}] ${msg}`,'color:green;')
  }

  get div(){
    if (undefined === this._div){
      this._div = DCreate('DIV',{inner:this.taggedHtml, class:'paragraph'})
      this.observe()
    } return this._div
  }

  get mots(){
    return this._mots || ( this._mots = this.instancieWords() )
  }
  get taggedHtml(){
    return this._taggedhtml || ( this._taggedhtml = this.tag() )
  }
  get html(){
    return this._html || ( this._html = md2html(this.md) )
  }


  /**
    On instancie les mots
  **/
  instancieWords(){
    var mots = this.splitInWords(this.md)
    return mots.map(mot => new Mot({real_init:mot, id:Mot.newId()}))
  }

  /**
    Découpe le paragraphe en mots
  **/
  splitInWords(str){
    // On remplace tous les caractères hors lettres par des espaces
    var str = str.replace(/[\[\]\{\}\(\)\!\?\.\;\:\*\&\#\@  \-—–…]/g,' ')
    console.log("str = ", str)
    str = str.replace(/  +/,' ')
    console.log("str final = ", str)
    return str.split(' ')
  }

  /**
    Méthode qui taggue le paragraphe en version HTML
  **/
  tag(){
    this.mots.forEach( mot => {
      this.html.replace(mot.reg, mot.span)
    })
  }


  observe(){
    this.div.addEventListener('click', this.onClick)
  }

  onClick(ev){
    this.log('-> onClick')
    this.oldContent = this.div.innerHTML
    this.div.contentEditable = true
    this.div.addEventListener('blur',   this.onBlur)
    this.log('<- onClick')
    this.div.focus()
    return stopEvent(ev)
  }

  /**
    Appelée quand on blur du paragraphe.
    On regarde s'il a été modifié.
  **/
  onBlur(ev){
    this.log('-> onBlur')
    this.div.removeEventListener('blur',   this.onBlur)
    this.div.contentEditable = false
    if ( this.contentHasChanged() ) {
      this.onChange(this.newContent)
    }
    this.log('<- onBlur')
    return stopEvent(ev)
  }

  /**
    Retourne true si le paragraphe a été modifié
  **/
  contentHasChanged(){
    this.newContent = this.div.innerHTML
    return this.newContent != this.oldContent
  }

  onChange(newCode){
    this.log('-> onChange')
    let initNewCode = String(newCode)
    console.log("On doit prendre en compte le contenu ", newCode)
    // TODO Étudier le cas où il y a un nouveau paragraphe
    if ( newCode.match(/<\/p><p>/) ) {
      var paragraphs = newCode.substring(3,newCode.length-4).split('</p><p>')
      console.log("Paragraphes : ", paragraphs)
      // TODO Attention plusieurs cas peuvent se produire :
      // 1. Un tout nouveau paragraphe a été créé après (sans reprendre de mots)
      // 2. Un nouveau paragraphe a été créé en sectionnant le paragraphe actuel
      //    => le nouveau contient des mots de l'ancien paragraphe
      // 3. Un nouveau paragraphe a été créé avant
      //    => Le nouveau paragraphe est le premier, le second est ce paragraphe-ci
      // 4. Des mots du début ont été copié à la fin pour créer une nouveau
      //    paragraphe. => Le nouveau paragraphe contient des mots de l'ancien
    }

    // TODO Il faut s'occuper des nouveaux mots et des mots supprimés
    // On passe en revue les mots du paragraphes en les supprimant dans le texte
    // et on regarde ceux qui restent et ceux qu'on a enlevé
    // On reprend le texte initial pour remplacer les nouveaux mots par leur
    // balise.
    var erasedWords = []
    this.mots.forEach(mot => {
      newCode.match(new RegExp(`data-id="${mot.id}"`)) || erasedWords.push(mot)
    })
    // On efface tous les mots connus
    newCode = newCode.replace(/<span class="mot([^<]+)<\/span>/g,'')
    var newWords = newCode.split(REG_NON_WORD_CHARACTERS)
    console.log("newWords = ", newWords)

    this.log('<- onChange')
  }

  /**
    Actualise la version tagguée du paragraphe dans la page tagguée
  **/
  update(newCode){
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
    return this._html || ( this._html = md2html(this.md) )
  }

  /**
    Le texte en version brut
  **/
  get raw(){
    return this._raw || (this._raw = html2raw(this.html))
  }

  /**
    Id du DIV du paragraphe dans la page normale
  **/
  get domId(){
    return this._domid || (this._domid = `parag-${this.id}`)
  }

  /**
    Identifiant du paragraphe (alias de index)
  **/
  get id(){
    return this.index
  }
}
