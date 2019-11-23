'use strict'
/**
  |
  | Classe Mot
  |
  | pour les mots
**/
class Mot {

  static reset(){
    delete this.items
    delete this.lastId
    this.items  = {}
    this.lastId = 0
  }

  /**
    Retourne l'instance Mot du mot d'id +mot_id+
  **/
  static get(mot_id){
    return this.items[mot_id]
  }

  /**
    Boucle la fonction +fun+ sur chaque mot
  **/
  static forEach(fun){
    for ( var motid in this.items ) {
      if ( false === fun(this.items[motid]) ) break ; // pour pouvoir interrompre
    }
  }

  static showNombre(){
    UI.infos_proximites.find('#nombre_mots').innerHTML = this.count()
  }

  // retourne en le calculant le nombre de mots courant
  static count() {
    return Object.keys(this.items).length
  }

  static newId(){
    this.lastId || (this.lastId = 0)
    return ++this.lastId
  }


  /** ---------------------------------------------------------------------
    |
    | INSTANCE DU MOT
    |
  **/
  constructor(data){
    this.data = data
    // on dispatche les données
    for ( var k in data ) { this[`_${k}`] = data[k] }
    // console.log("Instanciation du mot avec les données : ", data, this)
  }

  /** ---------------------------------------------------------------------
    *   Méthodes d'évènements
    *
  *** --------------------------------------------------------------------- */

  /**
    Méthode appelée quand on glisse la souris sur le mot, quand c'est un
    mot en proximité avec un autre. On met les deux mots en exergue et
    on affiche une info-bulle présentant les informations
  **/
  onMouseover(ev){
    // L'info-bulle pour afficher les informations + la mise en exergue
    // des mots en proximité.
    var infos = []
    for (var where of ['P','N']){
      var proxId = `prox${where}` // proxP ou proxN
      if (!this[proxId]) continue;
      var prox = this[proxId]
        , motx = prox[`mot${where=='P'?'A':'B'}`]
      var info = `Proximité avec '${motx.real_init}' à ${prox.distance} signes ${where=='P'?'avant':'après'}`
      if ( motx.pageNumber != this.pageNumber ) {
        info += ` <span class="red">(page ${where=='N'?'suivante':'précédente'})</span>`
      }
      infos.push(info)
      motx.taggedSpans.forEach(o => o.classList.add('exergue-prox'))
    }
    UI.infoBulle(infos.join(CR), ev)

    // La mise en exergue des mots proches

    return stopEvent(ev)
  }
  onMouseout(ev){
    // On ferme l'info bulle
    UI.hideInfoBulle()
    // On retirer la mise en exergue des mots en proximité
    this.proxP && this.proxP.motA.taggedSpans.forEach(o => o.classList.remove('exergue-prox'))
    this.proxN && this.proxN.motB.taggedSpans.forEach(o => o.classList.remove('exergue-prox'))
    return stopEvent(ev)
  }


  // ---------------------------------------------------------------------
  //  HELPERS

  /**
    Retourne l'objet DOM du span du mot
  **/
  get taggedSpan(){
    return this._taggedspan || (this._taggedspan = DGet(`.mot[data-id="${this.id}"]`, UI.taggedPagesSection))
  }
  get taggedSpans(){
    return this._taggedspans || (this._taggedspans = DGetAll(`.mot[data-id="${this.id}"]`, UI.taggedPagesSection))
  }

  /**
    Retourne l'objet DOM du mot
    ---------------------------
    Note : pour la page tagguée
  **/
  get asDom(){
    if ( undefined === this._asdom) {
      //
      //
      /*
        On détermine s'il faut rajouter quelque chose en début de mot qui
        viendrait d'un "reste" du mot précédent quand ce mot précédent est un
        délimiteur de paragraphe ou de page (ie contient un retour charriot dans
        son tbw).
        Pour rappel, si on trouve le texte :
        « Mon texte.
          - C'est mon texte.
        »
        Il sera découpé de cette manière :
          mot 2 : mot:"texte" tbw:".\n– "
          mot 3 : mot:"C", tbw:"'"
        Donc il faut ajouter le tiret de dialogue au mot 3 quand on le construit.
        Même chose pour un changement de page.
       */
      var fmot = this.mot
      if ( this.motP && (this.motP.isParagraphDelimitor||this.motP.isTextDelimitor)){
        fmot = `${this.motP.tbw_after_rc}${fmot}`
      }
      var ftbw
      if (this.isParagraphDelimitor||this.isTextDelimitor){
        ftbw = this.tbw_before_rc + this.tbw_rcs.replace(/\r?\n/g,'<br>')
      } else {
        ftbw = this.tbw
      }

      // Pour mettre tous les spans qui seront construits
      var spans = []

      /**
        Il faut un traitement spécial lorsque le mot est en proximité avant
        et en proximité après
      **/
      if ( this.proxP || this.proxN ) {
        // Quand il y a une proximité
        if ( this.proxP && this.proxN ) {
          // <= Quand les deux proximités sont définies
          // => Il faut découper le mot
          var len = fmot.length
            , moi = parseInt(len/2,10)
            , debMot = fmot.substring(0, moi)
            , finMot = fmot.substring(moi, len)
          spans.push(Dom.create('SPAN',{text:debMot, 'data-id':this.id, class:this.classProxP, 'data-prox':'P'}))
          spans.push(Dom.create('SPAN',{text:finMot, 'data-id':this.id, class:this.classProxN, 'data-prox':'N'}))
        } else if (this.proxP) {
          spans.push(Dom.create('SPAN',{text:fmot, 'data-id':this.id, class:this.classProxP, 'data-prox':'P'}))
        } else /* quand proxN */{
          spans.push(Dom.create('SPAN',{text:fmot, 'data-id':this.id, class:this.classProxN, 'data-prox':'N'}))
        }
      } else {
        // Quand ce mot n'est en proximité avec rien
        spans.push(Dom.create('SPAN',{text:fmot, 'data-id':this.id, class:'mot'}))
      }
      spans.push(Dom.create('SPAN',{text:ftbw}))

      this._asdom = spans
    } return this._asdom
  }

  /**
    Le span dans le text
  **/
  get span(){
    if (undefined === this._span){
      this._span = DCreate('SPAN',{class:'mot', 'data-id':this.id})
    } return this._span
  }

  get reg(){
    return this._reg || (this._reg = new RegExp(this.real_init))
  }

  /**
    Retourne true si le mot est en fait un délimiteur de texte
  **/
  get isTextDelimitor(){
    return this._istextdelimitor || ( this._istextdelimitor = this.tbw.match(PPage.REG_PAGE_DELIMITOR))
  }
  get isParagraphDelimitor(){
    return this._isrc || (this._isrc = this.tbw.match(/\n/))
  }

  get classProxP(){
    if (undefined === this._classproxp){
      var c = ['mot']
      this.proxP && c.push(this.indicateurCSSDistProxP)
      this._classproxp = c.join(' ')
    } return this._classproxp
  }
  get indicateurCSSDistProxP(){
    if ( undefined === this._indiccssdistproxp){
      this._indiccssdistproxp = ((d)=>{
        if      (d < 25)  return 'proxdanger'
        else if (d < 50)  return 'proxwarn'
        else if (d < 75)  return 'proxnotice'
        else              return 'proxpassab'
      })(this.relDistanceProxP)
      // console.log("'%s (#%d)' — Indicateur distance : '%s' (distance relative avec '%s' #%d : %d — %d/%d)", this.real_init, this.id, this._indiccssdistproxp, this.proxP.motA.real_init, this.proxP.motA.id, this.relDistanceProxP, this.distanceProxP, this.minimaleDistanceProxP)
    }
    return this._indiccssdistproxp
  }
  get classProxN(){
    if (undefined === this._classproxn){
      var c = ['mot']
      this.proxN && c.push(this.indicateurCSSDistProxN)
      this._classproxn = c.join(' ')
    } return this._classproxn
  }
  get indicateurCSSDistProxN(){
    if ( undefined === this._indiccssdistproxn){
      this._indiccssdistproxn = ((d)=>{
        if      (d < 25)  return 'proxdanger'
        else if (d < 50)  return 'proxwarn'
        else if (d < 75)  return 'proxnotice'
        else              return 'proxPassab'
      })(this.relDistanceProxN)
      // console.log("'%s (#%d)' - Indicateur distance : '%s' (distance relative avec '%s' (#%d) : %d — %d/%d)", this.real_init, this.id, this._indiccssdistproxn, this.proxN.motB.real_init, this.proxN.motB.id, this.relDistanceProxN, this.distanceProxN, this.minimaleDistanceProxN)
    }
    return this._indiccssdistproxn
  }

  /**
    Retourne l'objet DOM (pour le détruire ou le rendre éditable, par exemple)
  **/
  get domObj(){
    return UI.taggedPagesSection.find(`.mot[data-id="${this.id}"]`)
  }

  // ---------------------------------------------------------------------
  //  PROPERTIES VOLATILES

  // retourne l'instance {Mot} du mot qui précède le mot courant
  get motP(){
    return this._motp || (this._motp = Mot.get(this.idP))
  }
  // Retourne l'instance {Mot} du mot qui suit le mot courant
  get motN(){
    return this._motn || (this._motn = Mot.get(this.idN))
  }

  // Retourne l'instance {Canon} du mot
  get icanon(){
    return this._icanon || (this._icanon = Canon.get(this.canon))
  }

  /**
    La proximité avec un mot avant (if any)
  **/
  get proxP(){
    if (undefined === this._proxP){
      this._proxP = this.px_idP && Proximity.get(this.px_idP)
    }
    return this._proxP
  }
  /**
    La distance avec le mot en proximité avant
  **/
  get distanceProxP(){
    return this._distproxp || (this._distproxp = (this.proxP && this.proxP.distance))
  }
  /**
    La distance minimale qu'on doit avoir entre le mot et sa proximité avant
  **/
  get minimaleDistanceProxP(){
    return this._mindistproxp || (this._mindistproxp = (this.proxP && this.proxP.distance_minimale))
  }
  /**
    Le pourcentage de proximité par rapport à la distance et la
    distance minimale attendue.
    Ce chiffre correspond à un pourcentage. 100% signifie qu'on se trouve
    à la distance maximale tandis que 0% indiquerait que l'on se trouve tout
    proche du mot en proximité
  **/
  get relDistanceProxP(){
    if ( undefined === this._reldistproxp) {
      this._reldistproxp = parseInt(100 * (this.distanceProxP / this.minimaleDistanceProxP),10)
    } return this._reldistproxp
  }
  get relDistanceProxN(){
    if ( undefined === this._reldistproxn) {
      this._reldistproxn = parseInt(100 * (this.distanceProxN / this.minimaleDistanceProxN),10)
    } return this._reldistproxn
  }

  /**
    La proximité avec un mot après (if any)
  **/
  get proxN(){
    if (undefined === this._proxN){
      this._proxN = this.px_idN && Proximity.get(this.px_idN)
    }
    return this._proxN
  }
  /**
    La distance avec le mot en proximité avant
  **/
  get distanceProxN(){
    return this._distproxn || (this._distproxn = (this.proxN && this.proxN.distance))
  }
  /**
    La distance minimale qu'on doit avoir entre le mot et sa proximité avant
  **/
  get minimaleDistanceProxN(){
    return this._mindistproxn || (this._mindistproxn = (this.proxN && this.proxN.distance_minimale))
  }

  get mot(){return this._real_init}

  /**
    Quand le mot est une fin de paragraphe (tbw contient un retour charriot),
    ces deux méthodes retournent les textes avant et après ce retour de charriot
  **/
  get tbw_before_rc(){
    return this._tbw_before_rc || (this._tbw_before_rc = this.splitTbw().before)
  }
  get tbw_after_rc(){
    return this._tbw_after_rc || (this._tbw_after_rc = this.splitTbw().after)
  }
  // Les retours charriot entre before et after ci-dessus
  get tbw_rcs(){
    return this._tbw_rcs || (this._tbw_rcs = this.splitTbw().rcs)
  }
  splitTbw(){
    let spl = this.tbw.split(CR)
      , bef = spl[0]
      , num = spl.length
      , rcs = "".padEnd(num - 1,CR)
      , aft = spl[num-1]
    return {before:bef, after:aft, rcs:rcs}
  }

  /**
    Retourne le numéro de la page du mot (en fonction des préférences)

    Note : il est pris en lisant le data-id du conteneur de page tagguée
  **/
  get pageNumber(){
    if ( undefined === this._pagenumber ) {
      if ( this.taggedSpan ) {
        var ancestor = this.taggedSpan.parentNode
        while(!ancestor.classList.contains('tagged-page')){ancestor = ancestor.parentNode}
        this._pagenumber = parseInt(ancestor.getAttribute('data-id'),10)
      } else {
        console.error("Impossible de prendre le numéro de page du mot '%s' (#%d). Son span taggué n'existe pas…", this.real_init, this.id)
      }
    } return this._pagenumber
  }

  // ---------------------------------------------------------------------
  //  PROPERTIES SAVED

  get id()          {return this._id}
  // Identifiant du mot après et avant
  get idN()         {return this._idN}
  get idP()         {return this._idP}
  // Canon du mot
  // Forme canonique du mot (= lemma)
  get canon()       {return this._canon}
  get real_init()   {return this._real_init}
  get real()        {return this._real || this.real_init}
  // Version minuscule du mot
  get downcase()    {return this._downcase}
  // Forme lémmatisée du mot
  get lemma()       {return this._lemma}
  // Version du mot pour le classement
  get sortish()     {return this._sortish}
  // String entre ce mot et le mot suivant
  get tbw()         {return this._tbw}
  // Longueur du mot
  get length()      {return this._length || this.real.length}
  // Offset absolu (dans tout le texte)
  get offset()      {return this._offset}
  // Offset relatif (dans le document file_id)
  get rel_offset()  {return this._rel_offset}
  get file_id()     {return this._file_id}

  // Identifiant de la proximité avant (if any)
  get px_idP() { return this._px_idP }
  // Identifiant de la proximité après (if any)
  get px_idN() { return this._px_idN }
}
