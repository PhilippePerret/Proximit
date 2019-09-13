'use strict'

const DISTANCE_PROX_DEFAULT = 1500
const AROUND_LENGTH = 50

/**
  |
  | Classe Proximity
**/
class Proximity {

  // Retourne la proximité d'identifiant +prox_id+
  static get(prox_id){return this.items[prox_id]}

  /**
    On définit la valeur globale, qui est définie dans le fichier des
    résultats de l'analyse
  **/
  static set(datas){
    this.reset()
    for(var idx in datas.items){
      Object.assign(this.items, {[idx]: new Proximity(datas.items[idx].datas)})
    }
  }

  /**
    Remise à zéro des proximités
  **/
  static reset(){
    this.items          = {}
    this.semi_reset()
    UI.infos_proximites.clean()
    UI.buttons_proximites.clean()
  }

  /**
    Semi-réinitialisation, pour recalculer les valeurs volatiles
  **/
  static semi_reset(){
    this.current_index  = -1
    this._sortByCanon   = undefined
  }

  /**
    Initialisation des proximités
  **/
  static init(itext){
    // l'indice de la proximité courante, affichée
    this.current_index = -1
    this.showInfos(itext)
    UI.showButtonsProximites(itext)
  }

  /**
    | Affichage des infos de proximités du texte +itext+
  **/
  static showInfos(itext){
    UI.infos_proximites
      .clean()
      .append(Dom.createDiv({class:'bold', text:'Proximités'}))
      .append(rowData(null,"Nombre de proximités",itext.resultats.datas.proximites.datas.nombre,'nombre_proximites'))
      .append(rowData(null,"Nombre de mots",itext.resultats.datas.mots.datas.nombre_total_mots,'nombre_mots'))
      .append(rowData(null,"Nombre de canons",itext.resultats.datas.canons.datas.nombre,'nombre_canons'))
      .append(rowData(null,"Pourcentage proximités",itext.resultats.datas.proximites.datas.pourcentage,'pourcentage_proximites'))
      .append(rowData(null,"Proximités corrigés", "à voir",'corrected_proximites'))
  }

  /**
    |
    | Pour afficher les proximités
    |
  **/
  static showPrev(){
    if ( this.current_index <= 0 ){
      UI.message("DÉBUT DU TEXTE")
      return
    }
    this.show(this.current_index -= 1)
  }
  static showNext(){
    if ( undefined === this.items[this.current_index + 1]){
      UI.message("FIN DU TEXTE")
      return
    }
    this.show(this.current_index += 1)
  }

  /**
    Pour afficher les proximités, on ne procède pas toujours dans le sens
    des items définis ici. On peut fonctionner dans l'ordre des mots du
    texte ou dans l'ordre des canons (toutes les instances mot d'un même canon
    sont affichées à la suite). C'est une case à cocher, sous la bande de navi-
    gation, qui le détermine.
    Donc, avant d'afficher les proximités (ou lorsque cette case est modifiée),
    il faut préparer une liste dans l'ordre voulu.
  **/
  static get sortedItems(){
    if ( undefined === this._sorteditems ) {
      if ( this.sortByCanon ) {
        // Naturellement, la liste est classée par canon
        this._sorteditems = Object.values(this.items)
      } else {
        this._sorteditems = Object.values(this.items).sort((a,b) => a.motA.data.offset - b.motA.data.offset)
      }
      // this._sorteditems.forEach(item => console.log(`Item "${item.motA.mot}" d'offset : ${item.motA.offset}`))
    }
    return this._sorteditems
  }

  // Afficher la proximité d'index +idx+
  static show(idx){
    this.sortedItems[idx].show()
    // this.items[idx].show()
  }

  /**
    Boucle sur toutes les proximités
  **/
  static forEach(fun){
    for ( var idx in this.items ) {
      fun(this.items[idx])
    }
  }

  /**
    | Méthodes d'interaction avec l'interface
  **/

  // Méthode appelée quand on clique sur la case à cocher "Afficher par canon"
  static onCheckSortByCanon(ev){
    console.log("-> Proximity.onCheckSortByCanon")
    this._sortByCanon = document.querySelector('#cb-sort-by-canon').checked
    // Pour forcer le recalcul de la liste
    delete this._sorteditems
    this._sorteditems = undefined
    // Pour fonctionner vraiment bien, il faudrait mémoriser quel est la proximité
    // courante et régler le current_index pour que ça corresponde.

  }
  static get sortByCanon(){return this._sortByCanon || false}


  /**

    Méthode qui SUPPRIME LA PROXIMITÉ +iprox+

  **/
  static remove(iprox){

    const motA = iprox.motA
    const motB = iprox.motB

    // Dans les résultats
    // ------------------
    const itext = PTexte.current
    // On détruit cette proximité dans les résultats
    RESULTATS.removeProximity(motA.proxN)

    // Dans les items de Proximity
    // ---------------------------
    this.items[motA.px_idN] = undefined
    delete this.items[motA.px_idN]

    // Dans les instances des mots
    // ---------------------------
    motA._px_idN  = undefined
    motA._proxN   = undefined
    motB._px_idP  = undefined
    motB._proxP   = undefined

    // On reset l'objet proximité pour qu'il tienne compte de ces
    // changements.
    // NON : ça n'est pas si simple, sinon, on va perdre le fil de la
    // consultation des proximités
    // IL FAUT :
    //  - retenir la proximité courante
    //  - la resélectionner si elle existe toujours
    //  - sélectionner la suivante ou la nouvelle si elles existent
    this.semi_reset()

  }



  /** ---------------------------------------------------------------------
    |
    | INSTANCE DE LA PROXIMITÉ
    |
  **/
  constructor(data){
    this.data = data
    for (var k in data) { this[k] = data[k] }
  }

  /**
    Méthode d'affichage de la proximité
  **/
  show(){
    var dataAround = this.textAround(500)
    var div = Dom.createDiv({class:'portion'})
    div.append(Dom.createSpan({id:'before-words', text: dataAround.before}))
    div.append(Dom.createSpan({id:'word-before', text:dataAround.first_word, contentEditable:'true', class:'mot exergue'}))
    div.append(Dom.createSpan({id:'between-words', text: dataAround.between}))
    div.append(Dom.createSpan({id:'word-after', text: dataAround.second_word, contentEditable:'true', class:'mot exergue'}))
    div.append(Dom.createSpan({id:'after-words', text: dataAround.after}))
    UI.currentProximity
      .clean()
      .append(Dom.createDiv({text: `Proximité : « ${this.motA.mot} » ⇤ ${this.distance} ⇥ « ${this.motB.mot} » [offsets : ${this.motA.offset} ↹ ${this.motB.offset}]`}))
      .append(div)
    // Il faut observer les deux mots
    $("#word-before")
      .on('focus', this.motA.onFocus.bind(this.motA, this))
      .on('keypress', this.motA.onKeyPressed.bind(this.motA, this))
      .on('blur', this.motA.onBlur.bind(this.motA, this))
    $("#word-after")
      .on('focus', this.motB.onFocus.bind(this.motB, this))
      .on('keypress', this.motB.onKeyPressed.bind(this.motB, this))
      .on('blur', this.motB.onBlur.bind(this.motB, this))
  }

  // Retourne le texte comprennant les deux mots
  /**
    | Retourne :
    |   - la portion avant le premier mot (:before)
    |   - le mot tel qu'il doit être affiché (:first_word)
    |   - la portion entre les deux mots (:between)
    |   - le mot tel qu'il doit être affiché (:second_word)
    |   - la portion après le second mot (:after)
  **/
  textAround(min){
    var addedLen = 0

    // Longueur de texte qui doit être prise. On la calcule en fonction de
    // l'éloignement des deux mots, pouor obtenir toujours la distance minimale.
    const len = (this.motB.offset + this.motB.length) - this.motA.offset
    // Si une longueur minimale est définie, il faut voir si elle est atteinte
    // par l'intervalle entre les deux mots. Si ce n'est pas le cas, on
    // aggrandit ce qu'on doit prendre autour
    if ( undefined !== min && len < min) {
      addedLen = Math.round((min - len) / 2)
    }

    // Pour obtenir le texte entre les deux mots, on boucle depuis l'id
    // du premier mot (motA), jusqu'à l'id du second (motB) en ajoutant entre
    // chaque mot l'espace :tbw
    var next_mot = Mot.get(this.motA.idN) // il doit forcément exister
    var between = this.motA.tbw // texte entre le motA et le mot suivant
    while ( next_mot && next_mot.id != this.motB_id ) {
      between += next_mot.mot
      between += next_mot.tbw
      next_mot = Mot.get(next_mot.idN)
    }
    // console.log("between = '%s'", between)

    // Reconstitution du texte avant
    var before = ''
    // console.log("this.motA.idP = ", this.motA.idP)
    if ( undefined !== this.motA.idP ) {
      // <= Il y a un mot avant le premier mot
      // => On prend la longueur de texte voulue
      var motref = Mot.get(this.motA.idP)
      // console.log("motref:", motref)
      while ( motref && (before.length < AROUND_LENGTH + addedLen) ) {
        before = motref.mot + motref.tbw + before
        motref = Mot.get(motref.idP)
      }
    }
    // console.log("Before = '%s'", before)

    // Reconstitution du texte après le second mot (motB)
    var after = this.motB.tbw
    if ( undefined !== this.motB.idN) {
      var motref = Mot.get(this.motB.idN)
      while ( motref && (after.length < AROUND_LENGTH + addedLen) ) {
        after += motref.mot + motref.tbw
        motref = Mot.get(motref.idN)
      }
    }
    // console.log("After = '%s'", after)

    return {
      before:before, first_word:this.motA.mot, between:between, second_word:this.motB.mot, after:after
    }
  }

  get motA(){
    // console.log("-> motA (this.motA_id=%d)", this.motA_id)
    if (undefined === this._motA){
      this._motA = Mot.get(this.motA_id)
      if ( ! this._motA ) {
        console.error("Impossible d'obtenir le mot d'ID %d dans la liste : ", this.motA_id, Mot.items)
      }
    }
    return this._motA
  }

  get motB(){
    if (undefined === this._motB) {
      this._motB = Mot.get(this.motB_id)
      if ( ! this._motB ) {
        console.error("Impossible d'obtenir le mot d'index %d dans la liste : ", this.motB_id, Mot.items)
      }
    }
    return this._motB
  }

  get data_yaml(){
    return {
        class: this.classe
      , datas: this.datas
    }
  }
  get datas(){
    var h = {}
    for ( var k in this.properties ) { Object.assign(h, {[k]: this[k]}) }
    return h
  }

  get classe(){
    return 'TextAnalyzer::Analyse::TableResultats::Proximite'
  }

  get properties(){
    return {
        fixed:      {hname: "Proximité corrigée", values: [true,false]}
      , erased:     {hname: "Proximité supprimée", values: [true, false]}
      , ignored:    {hname: "Proximité à ignorer", values: [true, false]}
      , motA_id:    {hname: "Index du premier mot de la proximité"}
      , motB_id:    {hname: "Index du second mot de la proximité"}
      , distance:   {hname: "Distance entre les deux mots"}
      , distance_minimale: {hname: "Distance minimale de proximité (en deça, les mots sont en proximité)"}
      , created_at: {hname: "Date de création de cette proximité"}
      , updated_at: {hname: "Date de modification de cette proximité"}
    }
  }
}
