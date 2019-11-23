'use strict'
/** ---------------------------------------------------------------------
  *   Class PPage
    -----------
    Gestion des pages

Entendu que l'affichage d'un texte, quel que soit sa longueur,
se fait par page, pour accélérer tous les processus.

*** --------------------------------------------------------------------- */

class PPage {
  // Pour séparer les pages, sans que ça puisse entrer en collision avec des
  // éléments du texte (entendu que le maximum de retours qu'on puisse avoir
  // d'affilée dans un texte est 2)
  static get PAGE_SEPARATOR(){return CR+CR+CR+CR}
  static get REG_PAGE_DELIMITOR(){
    return this._regpagedelimitor || (this._regpagedelimitor = new RegExp(this.PAGE_SEPARATOR))
  }
  static get PAGE_DEFAULT_LENGTH(){return 1500}

  static get current(){ return this._current }
  static set current(v){
    if ( this._current ) {
      this.current.hide()
      delete this._current
    }
    this._current = v
    PTexte.current.currentPage = v
    this._current.show()
  }

  // Retourne l'instance PPage de la page de numéro +numero+
  // Rappel : les pages sont conservées dans la propriété `pages` du PTexte
  // courant
  static get(numero){
    return PTexte.current.pages[numero]
  }

  // Affiche la page suivante
  static next(ev){
    if ( this.current.next ){
      this.setCurrentPageTo(this.current.next.numero)
      this.setButtonsPrevNext()
      return stopEvent(ev)
    }
  }
  static prev(ev){
    if ( this.current.prev ) {
      this.setCurrentPageTo(this.current.prev.numero)
      this.setButtonsPrevNext()
      return stopEvent(ev)
    }
  }
  static setCurrentPageTo(numero){
    const curTexte = PTexte.current
    this.current = curTexte.pages[numero]
  }

  static setButtonsPrevNext(){
    const showBtnPrev = !this.current.isFirstPage
    const showBtnNext = !this.current.isLastPage
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
    var pages = [null/* couverture, pour que l'index corresponde au numéro*/]
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

  log(msg, params){
    if (undefined === params){
      console.log(`%cPage #${this.numero} ${msg}`, 'color:green;')
    } else {
      console.log(`%cPage #${this.numero} ${msg}`, params, 'color:green;')
    }
  }

  /**
    Affichage de la page
    --------------------
    Cela consiste à afficher la page et son miroir taggué.
    Si la page n'est pas construite, il faut la construire.

    NOTES
      - indique aussi le numéro de page et le nombre de
        signes.
  **/
  async show(){
    this.log("-> show()")
    this.built || await this.build()
    this.page.show()
    console.log("--- J'APPELLE show() de la taggedPage")
    this.taggedPage.show()
    // Indiquer le numéro de page
    DGet('#page-number').innerHTML = this.number
    // Indiquer la longueur courant du texte
    DGet('#text-length').innerHTML = this.originalText.length
    this.log("<- show()")
  }

  hide(){
    this.page.hide()
    this.taggedPage.hide()
  }

  /**
    Construction de la page normale
    -------------------------------
    Construction de la page, ça consiste à faire son div (de classe .page) et
    à créer un éditeur dessus.
    Procède aussi à la construction de la page tagguée (appelle this.buildTaggedPage)
  **/
  async build(){
    this.log("-> build()")
    this.built        || await this.buildPage()
    this.taggedBuilt  || await this.buildTaggedPage()
    this.log("<- build()")
  }

  async buildPage(){
    this.log("-> buildPage")
    this.div = DCreate('DIV',{id:this.domId, 'data-id':this.number, class:'page'})
    UI.workingPagesSection.append(this.div)
    // Instancier l'éditeur et mettre le texte de la page dedans
    await this.setEditor()
    // On marque que la page est construite
    this.built = true
    this.log("<- buildPage")
  }
  async buildTaggedPage(){
    this.log("-> buildTaggedPage")
    // On crée la page si c'est nécessaire (la première fois)
    DGet(this.taggedDomId) || (await this.createTaggedPage())
    this.checked || await this.check()
    this.log("<- buildTaggedPage")
  }

  /**
    Méthode qui place dans la section tagguée en miroir les paragraphes
    taggués (où apparaissent les proximités)
  **/
  async feedTaggedPage(paragraphs){
    const my = this
    this.log("-> feedTaggedPage(paragraphs)")
    if ( ! this.taggedBuilt ) {
      // <= La page tagguée n'existe pas
      // => Il faut la construire
      await this.createTaggedPage()
    } else {
      // <= La page tagguée existe
      // => Il faut la nettoyer (la vider)
      this.taggedPage.clean()
    }
    var paragIndex = 0 // +1 start
    let paragCount   = paragraphs.length

    paragraphs.map(taggedCode => {
      ++paragIndex
      var pparag = PParagraph.get(`${my.numero}_${paragIndex}`)
      pparag && pparag.update(taggedCode)
    })

    // On observe les mots taggué
    this.taggedPage.findAll('.mot[data-prox]').forEach(mdom => {
      var mot = Mot.get(parseInt(mdom.getAttribute('data-id'),10))
      mdom.addEventListener('mouseover', mot.onMouseover.bind(mot))
      mdom.addEventListener('mouseout', mot.onMouseout.bind(mot))
    })

    this.log("<- feedTaggedPage")
  }

  /**
    Checke des proximités de la page
    --------------------------------
    Méthode principale qui checke la page et affiche son miroir (page tagguée)
    comportant toutes les proximités trouvées en fonction des paramètres.
  **/
  async check(){
    this.log("-> check()")
    const my = this

    // On récupère le texte qui doit servir pour le check
    var portion = this.getCheckableTexte()

    // console.log("+++ Portion à analyser : ", portion)

    // On procède à l'analyse (elle prend un certain temps)
    await TexteAnalyse.analyze(portion)

    // On analyse le retour, principalement en récupérant les pages et
    // les paragraphes
    TexteAnalyse.tag()
      .then(this.afterCheck.bind(this))
      .catch(err => {throw(err)})

    this.log("<- check")
  }

  /**
    Méthode appelée avec les portions de texte taggué (après le check)

    @param {Array} taggedTexts Données retournée par TexteAnalyse après
          l'analyse du texte fourni.
          C'est une liste de données de texte
          Chaque donnée est une page
          chaque donnée de page contient une liste de paragraphes
          Chaque paragraphe est un DIV de class 'paragraph' qui contient
          les mots taggués.
  **/
  async afterCheck(taggedTexts){
    this.log("-> afterCheck")

    console.log("taggedTexts = ", taggedTexts)

    // L'index du texte à afficher en fonction du numéro de page. Si
    // c'est la première page, on prend la première portion
    // Si c'est la dernière page, on prend la dernière portion. Si c'est une
    // autre page, on prend la deuxième (sur 3 ou 2)
    this.taggedParagraphs = (()=>{
      if ( this.isFirstPage ) {
        return taggedTexts[0]
      } else if ( this.isLastPage ) {
        return taggedTexts[portions.length-1]
      } else {
        return taggedTexts[1]
      }
    })()

    // On peut afficher les paragraphes dans la page tagguée
    await this.feedTaggedPage(this.taggedParagraphs)

    // On s'occupe ensuite des autres pages, quitte à faire…
    if ( this.isFirstPage ) {
      this.next && (await this.next.feedTaggedPage(taggedTexts[1]))
    } else if ( this.isLastPage ) {
      await this.prev.feedTaggedPage(taggedTexts[0])
    } else {
      await this.prev.feedTaggedPage(taggedTexts[0])
      this.next && (await this.next.feedTaggedPage(taggedTexts[2]))
    }
    this.checked = true
    this.log("<- afterCheck")
  }

  /**
    Méthode qui retourne le texte à checker pour les proximités en
    fonction de la place de la page (première, dernière, normale)
    @return {String} Le texte à checker (par la méthode `check`)
  **/
  getCheckableTexte(){
    this.log('-> getCheckableTexte')
    var portion = []
    this.isFirstPage  || portion.push(this.prev.rawText)
    portion.push(this.rawText)
    this.isLastPage   || portion.push(this.next.rawText)
    portion = portion.join(` ${PPage.PAGE_SEPARATOR} `)
    // console.log("Portion pris en compte pour le check des proximités : <<<%s>>>", portion)
    return portion
  }

  /**
    Crée la page "taggué" en miroir et regard du texte courant
    Note : mais ne la remplit pas. C'est la méthode feedTaggedPage qui s'en
    occupe
  **/
  async createTaggedPage(){
    this.log('-> createTaggedPage()')

    // Créer un div pour cette page
    UI.taggedPagesSection.append(
      DCreate('DIV',{class:'tagged-page noDisplay',id:this.taggedDomId, 'data-id':this.id})
    )
    this.taggedPage = new UIObject(`#tagged-page-${this.id}`)

    this.taggedBuilt = true

    this.log('<- createTaggedPage')
  }


  onEditorReady(){
    const my = this
    this.editor.save().then(my.forSave.bind(my))
  }

  forSave(data){
    this.log('-> forSave(...)')
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
    this.log('<- forSave')
  }

  /**
    Appelé lorsqu'un paragraphe a été modifié
  **/
  async onChange(){
    const my = this
    my.log('-> onChange')
    if(my.doNothingWhenChange){
      my.log('<- onChange (court-circuitée car `doNothingWhenChange` est true)')
      return
    }
    if (MyParagraph.current){
      // console.log("Le paragraphe #%s a été modifié", MyParagraph.current.id)
      var [pageId, paragId] = MyParagraph.current.id.split('_')
      pageId  = parseInt(pageId,10)
      paragId = parseInt(paragId,10)
      // Car il peut ne pas exister, si on a été vite ou si on a
      // ouvert l'input pour l'url d'un lien.
      let savedData = MyParagraph.current.save()
      my.log("Le paragraphe modifié est le paragraphe : “%s”", savedData.md)
      // On le modifie dans currentData pour l'enregistrement
      this.currentData.blocks[paragId - 1].data = savedData
      // On doit modifier le raw text pour que les proximités puissent être
      // étudiées
      delete this._rawtext
      // Si les préférences le demandent, il faut checker à nouveau la page
      if ( true ) this.check()
    } else {
      // Ça se produit par exemple lorsqu'on ajoute un paragraphe au paragraphe
      // en passant à la ligne.
      // Dans ce cas-là, on se retrouve sur une ligne sans 'data-id'.
      my.log("Modification, mais sans paragraphe courant.")
      // On fait deux choses ici pour le moment :
      //  1. on récupère le contenu du paragraphe (en le passant en markdown)
      //  2. on modifie l'identifiant du paragraphe
      var paragIndex = 0 // +1-start

      // On réinitialise la liste des paragraphes de la page
      my.paragraphes = []

      // C'est assez lourd, mais pendant qu'on place les 'data-id' sur les
      // paragraphes, il faut couper la méthode onChange de la page qui serait
      // sinon appelée chaque fois.
      my.doNothingWhenChange = true
      my.log("doNothingWhenChange est mis à true")
      // delete my.editor.onChange

      // On boucle sur les paragraphes actuels pour les relever
      DGetAll('div.codex-editor__redactor div.ce-block div.ce-paragraph',this.page.domObj)
      .forEach(div => {
        // console.log("Paragraphe “%s”", div.innerHTML)
        div.setAttribute('data-id', `${my.id}_${++paragIndex}`)
        my.paragraphes.push(new PParagraph(my,{md:html2md(div.innerHTML), index:paragIndex}))
      })

      console.log("--- my.paragraphes mis à ", my.paragraphes)
      // On actualise le texte (les blocks) et on demande un check
      delete my._rawtext
      my.paragraphs2blocks()
      await my.check()

      // my.editor.onChange = my.onChange.bind(my)
      my.log("doNothingWhenChange est remis à false")
      my.doNothingWhenChange = false

    }
    my.log('<- onChange (@sync parfois)')
  }

  /**
    Transforme le texte original de la page en données Block pour editorjs
  **/
  text2blocks(){
    const my = this

    var index  = -1
    // Index du paragraphe, pour construire son ID, qui est composé du
    // numéro de la page et de son index dans la page ('parag_<page>_<index>')
      , paragIndex = 0

    this.paragraphes = this.originalText.split(CR).map(paragText => {
      return new PParagraph(this, {index:++paragIndex, md:paragText})
    })
    console.log("=== Nombre de paragraphes : %d", this.paragraphes.length)
    // console.log("this.paragraphes = ", this.paragraphes)

    return this.paragraphs2blocks()
  }

  /**
    Prends les this.paragraphes (instance PParagraph de la page) pour
    construire une données `blocks` correspondant à editorjs
  **/
  paragraphs2blocks(){
    const my = this
    var blocks = []
    my.paragraphes.forEach(pparag => {
      blocks.push({type:'myparagraph',
        data:{
            md_original:pparag.md
          , text:   pparag.md // il faut garder 'text' pour editorjs
          , md:     pparag.md
          , html:   pparag.html
          , raw:    pparag.raw
          , page:   my
          , index:  pparag.index
        }})
    })
    this._blocks = blocks
    return blocks
  }

  /**
    Retourne le texte brut (pour comparaison de proximité) à partir des
    blocks définis.

    Note : on pourrait aussi partir des paragraphes (this.paragraphes)
    Note : c'est cette méthode qui alimente this.rawText
  **/
  blocks2text(){
    const my = this
    my.log("-> blocks2text")
    var t = []
    this.blocks.forEach(dparag => t.push(dparag.data.raw))
    my.log('<- blocks2text')
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

  get isFirstPage(){ return this.numero == 1 }
  get isLastPage(){ return this.numero == PPage.lastNumero }


  /**
    Le texte brut de la page
    ------------------------
    Comme il est au départ et comme il sera modifié au cours
    du travail d'écriture.
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

  /**
    Identifiant de la version page tagguée
  **/
  get taggedDomId(){
    return this._tagdomid || ( this._tagdomid = `tagged-page-${this.id}` )
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

  // Page suivante ({PPage})
  get next(){
    return this._next || (this._next = PPage.get(this.numero+1))
  }

  /**
    Alias de number
    TODO En fait, il faudrait supprimer `number`, qui est moins intuitif ici
    et n'est même pas plus court.
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
