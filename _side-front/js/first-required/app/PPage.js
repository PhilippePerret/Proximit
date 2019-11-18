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

  static get current(){ return this._current }
  static set current(v){
    if ( this._current ) {
      this.current.hide()
      delete this._current
    }
    this._current = v
    PTexte.current.currentPage = v
    this._current.edit()
  }

  // Retourne l'instance PPage de la page de numéro +numero+
  // Rappel : les pages sont conservées dans la propriété `pages` du PTexte
  // courant
  static get(numero){
    return PTexte.current.pages[numero]
  }

  // Affiche la page suivante
  static next(ev){
    if ( this.current.numero < this.lastNumero ){
      this.setCurrentPageTo(this.current.numero + 1)
      this.setButtonsPrevNext()
      return stopEvent(ev)
    }
  }
  static prev(ev){
    if ( this.current.numero > 1 ) {
      this.setCurrentPageTo(this.current.numero - 1)
      this.setButtonsPrevNext()
      return stopEvent(ev)
    }
  }
  static setCurrentPageTo(numero){
    const curTexte = PTexte.current
    this.current = curTexte.pages[numero - 1]
  }

  static setButtonsPrevNext(){
    const showBtnPrev = this.current.numero > 1
    const showBtnNext = this.current.numero < this.lastNumero
    $('.btn-prev-page')[showBtnPrev?'removeClass':'addClass']('hidden')
    $('.btn-next-page')[showBtnNext?'removeClass':'addClass']('hidden')
  }

  /**
    Découpe le texte +str+ en pages (instances PPage)
    Si +owner+ est défini, c'est le PTexte concerné et on met les pages
    dans sa propriétés `pages`. Sinon, on les conserve ici dans
    this.items(/PPage.items) (array)
  **/
  static split(str, owner){
    var pages = []
      , pageNumber  = 0
      , pageOffset  = 0 // offset de la page
      , portion
      , excess = 0
      , lenPageWithExcess

    // La longueur pour une page, d'après les préférences (1500 par défaut)
    const PageDefLen = PTexte.PAGE_LENGTH

    // On commence par interdire les retours de charriot multiples
    let regCharriots = RegExp(`${CR}${CR}+`,'g')
    str = str.replace(regCharriots, CR+CR)

    while(str.length){
      if ( str.length < PageDefLen ){
        // <= Il reste moins de caractères que pour une page
        // => On en fait la dernière page et on s'arrête
        portion = str
        str = ''
      } else {
        // On cherche le premier point autour de 1500 pages
        // Pour ce faire,
        /**
          On cherche le point le plus prêt des 1500 signes
          Pour ce faire, on prend la portion de texte entre
          la longueur de page - 100 et la longueur de page + 100
          et l'on cherche le point qui se rapproche le plus de 100 (tole)
        **/

        lenPageWithExcess = PageDefLen - excess

        // On cherche une portion de texte qui contienne un point
        var tole = 0
        do {
          tole += 100
          portion = str.substring(lenPageWithExcess - tole, lenPageWithExcess + tole)
        } while(!portion.match(/[\.\!\?\…\;]/))

        // On récupère les points
        var points = []
        var pointsFound = portion.matchAll(/([\.\!\?\…\;])/g)
        var point = {}
        while( ! (point = pointsFound.next()).done ){
          // console.log("Point étudié : ", point)
          points.push({loin: Math.abs(point.value.index - tole), offset:point.value.index, sign:point.value[0]})
        }
        // console.log("Points : ", points)

        // On classe la liste pour prendre le point le plus proche de tole
        points = points.sort((a,b) => {return a.loin > b.loin ? 1 : -1})

        // On prend le point le plus proche
        point = points[0]
        // console.log("Premier point : ", point)

        var lastIndex = lenPageWithExcess - tole + point.offset + 1 + 1 /* caractère suivant */
        portion = str.substring(0, lastIndex)
        str = str.substring(lastIndex, str.length)
        // console.log("--- portion : «%s»", portion)
      }

      var portionLen = portion.length
      var lastChar = portion.substring(portionLen - 1, portionLen)
      if ( lastChar == ' ' || lastChar == CR ) {
        console.log("Se finit bien par une espace ou un retour chariot")
      } else {
        console.log("Se finit par le caractère '%s'", lastChar)
      }

      // On utilie +excess+ pour rattraper le dépassement lors du prochain
      // découpage de page (page suivante)
      excess = portionLen - lenPageWithExcess // négatif si dépasse

      ++pageNumber
      pages.push(new PPage(portion, pageNumber, pageOffset, lastChar))
      pageOffset += portion.length
      // console.log("pageOffset pour suivre : %d", pageOffset)
    }//Fin de boucle pour découper le texte

    if ( owner ) {
      owner.pages = pages
    } else {
      this.items = pages
    }

    this.lastNumero = pageNumber
    DGet('#page-number-total').innerHTML = this.lastNumero

    // console.log('Pages instanciées : ', pages)
    pages = null
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(str, number, offset, lastChar){
    this.originalText = str
    this.number = number
    this.offset = offset // offset du premier signe
    this.lastCharacter = lastChar
  }

  async edit(){
    console.log("Édition de la page #", this.number)
    // Si la page n'est pas encore construite, il faut la construire
    if (!this.built) this.build()
    else this.show()
    // Indiquer le numéro de page
    DGet('#page-number').innerHTML = this.number
    // Indiquer la longueur courant du texte
    DGet('#text-length').innerHTML = this.originalText.length
  }

  show(){
    this.page.show()
    this.taggedPage.show()
  }
  hide(){
    this.page.hide()
    this.taggedPage.hide()
  }

  /**
    Construction de la page, ça consiste à faire son div (de classe .page) et
    à créer un éditeur dessus.
  **/
  async build(){
    if (this.built) return
    this.div = DCreate('DIV',{id:this.domId, 'data-id':this.number, class:'page'})
    UI.workingPagesSection.append(this.div)
    // Mettre le texte dans l'éditeur
    await this.setEditor()
    // On checke la page (pour sa construction)
    this.check()
    // On marque que la page est construite
    this.built = true
  }

  // Pour séparer les pages, sans que ça puisse entrer en collision avec des
  // éléments du texte (entendu que le maximum de retours qu'on puisse avoir
  // d'affilée dans un texte est 2)
  static get PAGE_SEPARATOR(){return CR+CR+CR+CR}
  /**
    Méthode principale qui checke la page et affiche son miroir (page tagguée)
    comportant toutes les proximités trouvées en fonction des paramètres.
  **/
  async check(){
    console.log("-> check")
    const my = this
    // La première chose à faire est de récupérer le texte qui doit servir de
    // base. Ce texte correspond au texte de la page courante à laquelle il
    // faut ajouter le texte de la page précédente (if any) et le texte de la
    // page suivante (if any)
    var portion = []
    if( this.numero > 1 ) {
      portion.push(this.prev.rawText)
    }
    portion.push(this.rawText)
    if (this.numero < PPage.lastNumero){
      portion.push(this.next.rawText)
    }
    portion = portion.join(` ${PPage.PAGE_SEPARATOR} `)
    console.log("Portion pris en compte pour le check des proximités : <<<%s>>>", portion)

    // On procède à l'analyse
    await TexteAnalyse.analyze(portion)

    TexteAnalyse.tag()
      .then( taggedTexte => {
        // console.log("==== Texte taggué : <<<%s>>>", taggedTexte.outerHTML)
        // Le délimiteur de texte
        var portions = taggedTexte.innerHTML.split('<br><br><br><br>')
        // console.log("====> Portions de textes taggués :",portions)
        // portions.forEach(portion => console.log("  == portion : >>>%s<<<", portion))

        // L'index de la portion à afficher en fonction du numéro de page. Si
        // c'est la première page, on prend la première portion
        // Si c'est la dernière page, on prend la dernière portion. Si c'est une
        // autre page, on prend la deuxième (sur 3 ou 2)
        var portionPage
        if ( this.isFirstPage ) {
          portionPage = portions[0]
        } else if ( this.isLastPage ) {
          portionPage = portions[portions.length-1]
        } else {
          portionPage = portions[1]
        }

        // On peut la mettre dans la fenêtre
        my.showTaggedVersion(portionPage)
      })
    console.log("<- check")
  }

  /**
    Affiche le code HTML +htmlCode+ en miroir du texte courant
  **/
  showTaggedVersion(htmlCode){
    // Créer un div pour cette page
    if (!DGet(`#tagged-page-${this.id}`)){
      var d = DCreate('DIV',{class:'tagged-page',id:`tagged-page-${this.id}`, 'data-id':this.id, inner:htmlCode})
      UI.taggedPagesSection.append(d)
      this.taggedPage = new UIObject(`#tagged-page-${this.id}`)
      d = null
    }
    this.taggedPage.show()
  }

  get isFirstPage(){ return this.numero == 1 }
  get isLastPage(){ return this.numero == PPage.lastNumero }

  onEditorReady(){
    const my = this
    console.log("Je vais capter les données une première fois")
    this.editor.save().then(my.forSave.bind(my))
  }

  forSave(data){
    console.log("-> PPage.forSave")
    // console.log("Data du texte renvoyées par le save de editorjs", data)
    if ( undefined === this.initialData ){
      console.log("C'est le premier appel")
      this.initialData = data
      this.currentData = data
      console.log("this.initialData = ", this.initialData)
    } else {
      // C'est une modification
      console.log("C'est une première modification")
    }
  }

  /**
    Appelé lorsqu'un paragraphe a été modifié
  **/
  onChange(){
    const my = this
    console.log("Un paragraphe a été changé")
    // // TODO Passer en revue les paragraphes de la page pour le trouver
    // this.editor.save().then(my.studyChanges.bind(my))
    if (MyParagraph.current){
      // Car il peut ne pas exister, si on a été vite ou si on a
      // ouvert l'input pour l'url d'un lien.
      console.log("Le paragraphe modifié est le paragraphe : %s", MyParagraph.current.save().md)
    }
  }

  /**
    Méthode appelée pour comparer les données actuelles (currentData)
    avec les données +newData+ envoyées
    Note : les +newData+ sont les données actuellement affichées dans l'éditeur
    de la page.
  **/
  studyChanges(newData){
    console.log("-> studyChanges")
    const paragsCount = this.currentData.blocks.length;
    // console.log("paragsCount = ", paragsCount)
    // console.log("this.currentData.blocks:", this.currentData.blocks)

    for(var iparag = 0; iparag < paragsCount; ++iparag){
      var curParag = this.currentData.blocks[iparag].data.text
      var newParag = newData.blocks[iparag].data.text
      if ( curParag != newParag ) {
        console.log("Le paragraphe %d a changé :\n---- «%s»\ncontre :\n---- «%s»", iparag, curParag, newParag)
      }
    }
  }
  /**
    Transforme le texte original de la page en données Block pour editorjs
  **/
  text2blocks(){
    var blocks = []
    var index  = -1
    this.originalText.split(CR).forEach(parag => {
      var html = md2html(parag)
      blocks.push({type:'myparagraph',
        data:{
            md_original:parag
          , text:parag
          , html:html
          , raw: html2raw(html)
        }})
    })
    return blocks
  }

  blocks2text(){
    var t = []
    this.blocks.forEach(dparag => {
      t.push(dparag.data.raw)
    })
    return t.join(CR)
  }

  async setEditor(){
    var my = this
    my._editor = new NMEditorJS({
        holder: this.domId
      , tools:{
          myparagraph: {
              class:MyParagraph
            , inlineToolbar:true
          }
        }
      , data:{time:(new Date().getTime()), blocks:my.blocks}
      , onChange: my.onChange.bind(my)
      , onReady:  my.onEditorReady.bind(my)
    })
    await this._editor.isReady;
  }
  destroyEditor(){this.editor.destroy()}

  /**
    Le texte brut de la page
  **/
  get rawText(){
    return this._rawtext || (this._rawtext = this.blocks2text().trim())
  }

  /**
    ID de la page (correspond au numéro de page)
  **/
  get id(){
    return this.number
  }

  /**
    ID du div de la page dans le DOM
  **/
  get domId(){
    return this._domid || (this._domid = `page-${this.number}`)
  }

  // Retourne l'instance UIObject de la page dans le DOM
  get page(){
    return this._page || (this._page = new UIObject(`#${this.domId}`))
  }

  // Retourne l'instance PPage de la page suivante (if any)
  // ou précédente
  get prev(){
    return this._prev || (this._prev = PPage.get(this.numero-1))
  }
  get next(){
    return this._next || (this._next = PPage.get(this.numero+1))
  }
  /**
    Alias de number
  **/
  get numero(){return this.number}

  /**
    L'éditeur de la page
  **/
  get editor(){ return this._editor }

  /**
    Retourne le texte de la page sous la forme de blocks prêts pour editorjs
  **/
  get blocks(){
    return this._blocks || ( this._blocks = this.text2blocks() )
  }
}
