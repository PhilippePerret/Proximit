'use strict'
/**
  |
  | Class Canon
  |
  | Pour la gestion des canons
  |
  | Les canons sont les termes canoniques qui sont trouvés dans le texte.
  | Cette donnée contient beaucoup plus d'informations que la donnée `:mots`.
  |
**/
const NLP = require('nlp-js-tools-french')
const NLP_CONFIG = {
    strictness: false
  , tagTypes: ["adj", "adv", "art", "con", "nom", "ono", "pre", "ver", "pro"]
  , minimumLength: 1
  , debug: false
}

class Canon {

  static set(datas) {
    this.items = {}
    // console.log("-> Canon.set()", datas.items)
    for ( var mot in datas.items ) {
      var canon = new Canon(datas.items[mot].datas)
      Object.assign(this.items, { [mot]: canon})
      canon.dispatchMots()
    }
  }

  // @return {Canon} le canon du mot +motstr+
  // Il doit exister, ici, sinon invoquer plutôt la méthode `Canon.of`
  static get(motstr){
    return this.items[motstr]
  }

  /**
    Pour créer un nouveau canon à partir du mot {String} +canon+
  **/
  static createNew(canon){
    let data_canon = {
        canon: canon
      , proximites: []
      , mots:[]
      , nombre_occurences: 0
      , nombre_proximites: 0
    }
    let instance_canon = new Canon(data_canon)
    Object.assign(this.items, {[canon]: instance_canon})
    return instance_canon
  }

  /**
    | Trouve la forme canonique du mot +motstr+ et la retourne comme premier
    | argument en appelant la méthode +callback+
    | Si options et options.create est true, le canon est créé s'il n'existe pas
    | Si options et options.force est true, on demande le nom du canon. Sinon,
    | la méthode est @synchrone et on retourne null
  **/
  static of(motstr, options, callback){
    const my = this
    options = options || {}
    let canon = this.canonicFormOf(motstr)
    if ( canon === "<unknown>") {
      if ( options.force === true ) {
        prompt(`Impossible de trouver un canon pour le mot « ${motstr} ». Lequel dois-je utiliser ?`,{
          title: 'Canon introuvable'
          , buttons:[{text:"Le même", onclick:my.onSetCanon.bind(my,motstr)}, {text:"OK", onclick:my.onSetCanon.bind(my,null)}]
        })
      }
      return null
    } else {
      let theCanon = this.get(canon)
      if ( undefined === theCanon ) {
        // Ce canon n'existe pas, il n'y aura donc aucun problème de proximité
        // avec ce mot, on peut le créer (mais c'est peut-être juste un check)
        if ( options.create === true) {
          let newCanon = this.createNew(canon)
          // Il faut indiquer que ce canon est une nouvelle donnée à
          // prendre en compte pour le projet, nouvelle donnée qu'on doit
          // tout de suite enregistrer sur fichier.
          Addendum.addCanon(newCanon)
          // On retourne ce canon
          return newCanon
        } else {
          return theCanon
        }
      }
    }
  }

  /**
    Méthode appelée quand on doit définir explicitement le canon du mot, car
    il n'a pas été trouvé pas npl-js-tools-french ou tree-tagger-french.
  **/
  static onSetCanon(mot_init, can){
    let canon = mot_init || can // 'mot_init' est null, si on a défini le canon 'can'
    let newCanon = this.createNew(canon)
    // Il faut ajouter ce canon à la addendum
    Addendum.addCanon(newCanon)
    ProxModif.current.create_single_word_in_canon(canon, newCanon)
  }

  /*
    | Retourne la forme canonique du mot {String} motstr
    | ---------------------------------------------------
    | Note : on utilise pour ce faire : nlp-js-tool-french et tree-tagger-french
    | nlp-js-tool-french ne traite pas les participes, il considère que
    | "vendu" a pour canon "vendu". Si le mot est identique, on utilise
    | tree-tagger-french qui est meilleur mais qui nécessite du temps.
    |
  **/
  static canonicFormOf(motstr, with_nlp){
    var can = (new NLP(motstr, NLP_CONFIG)).lemmatizer()[0].lemma
    if ( can == motstr ) {
      can = exec(`echo "${motstr}" | tree-tagger-french`)
              .toString().trim().split("\t")[2]
    }
    return can
  }
  /**
    |
    | INSTANCES
    |
  **/
  constructor(data){
    // console.log("Canon.instance avec", data)
    this.data = data
    console.log("data canon:", data)
    for ( var k in data ){
      if ( k === 'mots' ) continue ;
      else if ( k === 'distance_minimale' ) this._proxdistance = data[k] ;
      else this[k] = data[k]
    }
  }


  /**
    À l'instanciation, on peut demander à dispatcher les mots
    Retourne la liste des instances {Mot} créées et la met aussi dans
    this._mots
  **/
  dispatchMots(){
    var arr = []
    for ( var id in this.data.mots ) {
      var mot = Mot.add(this.data.mots[id].datas)
      arr.push(mot)
    }
    this._mots = arr
    return arr
  }

  // Retourne la liste {Array} des instances {Mot} des mots
  // du canon
  // Note : attention, :mots est une propriété des données d'un canon
  // donc on ne peut pas se servir de cette valeur pour l'enregistrer
  get mots(){return this._mots || (this._mots = this.dispatchMots())}

  /**
    Retourne la liste des offsets des mots du canon
  **/
  get offsets(){
    if (undefined === this._offsets) {
      this._offsets = []
      this.mots.forEach( mot => this._offsets.push(mot.offset) )
    }
    return this._offsets
  }

  /**
    La distance minimale pour détecter une proximité (1500 par défaut)
  **/
  get proxDistance(){
    if (undefined === this._proxdistance) {
      this._proxdistance = DISTANCE_PROX_DEFAULT
    }
    return this._proxdistance
  }

  /**
    Pour ajouter le mot +imot+ au canon
  **/
  addMot(imot){
    console.log("Je dois ajouter le mot %s au canon", imot.mot, this)
  }

  /**
    Retourne true si le canon possède un mot proche de l'offset +offset+
  **/
  hasNearMot(offset){
    for ( var i in this.offsets ) {
      if ( Math.abs(this.offsets - offset) >= this.proxDistance ) {
        return this.mots[parseInt(i,10)]
      }
    }
    return null
  }
}
