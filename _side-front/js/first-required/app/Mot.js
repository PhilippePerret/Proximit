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

  // ---------------------------------------------------------------------
  //  HELPERS

  get asDom(){
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
    return [
        Dom.create('SPAN',{text:fmot, 'data-id':this.id, class:this.class})
      , Dom.create('SPAN',{text:ftbw})
    ]
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

  // Retourne le className de l'élément contenant le mot
  get class(){
    if (undefined === this._class){
      var c = ['mot']
      // Si le mot est en proximité, il faut le signaler avec un indicateur
      // différent en fonction de la distance.
      if (this.px_idP || this.px_idN) {
        c.push(this.indicateurCSSDistance)
        // TODO ajouter en attributs les données qui permettront de
        // construire l'info-bulle qui donnera les infos sur la proximité
      }
      this._class = c.join(' ')
      c = null
    }
    return this._class
  }

  /**
    Retourne la classe CSS qui correspond à la distance relative du
    mot par rapport à sa proximité.

    On considère :
      Qu'il y a danger (proxdanger) lorsque le mot est à moins d'un quart
      de la distance minimale (pour 1200 signes, ce serait à 300 signes)
  **/
  get indicateurCSSDistance(){
    if ( undefined === this._indiccssdist){
      // On prend la plus petite distance relative
      var dists = [], dist
      this.proxP && dists.push(this.relDistanceProxP)
      this.proxN && dists.push(this.relDistanceProxN)
      var dist = Math.min(...dists)
      console.log("Dists, Dist = ", dists, dist)
      if ( isNaN(dist) ) {
        console.log("Mot sans dist",{
            px_idN:this.px_idN
          , px_idP:this.px_idP
          , proxN: this.proxN
          , proxP: this.proxP
          , distanceP: this.proxP.distance
          , distanceN: this.proxN.distance
          , minDistP: this.proxP.distance_minimale
          , minDistN: this.proxN.distance_minimale
        })
      }

      this._indiccssdist = ((d)=>{
        if      (d < 25)  return 'proxdanger'
        else if (d < 50)  return 'proxwarn'
        else if (d < 75)  return 'proxnotice'
        else              return 'proxpassab'
      })(dist)
      console.log("Indicateur distance : ", this._indiccssdist)
    }
    return this._indiccssdist
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
      this._proxP = this.px_idP ? Proximity.get(this.px_idP) : null
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
      this._proxN = this.px_idN ? Proximity.get(this.px_idN) : null
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
