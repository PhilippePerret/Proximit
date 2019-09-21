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

  static get properties() {
    return {
        'canon':              'c'
      , 'distance_minimale':  'dm'
      , 'nombre_proximites':  'np'
      , 'nombre_occurences':  'nm'
      , 'mots':               'ms'
      , 'proximites':         'ps'
    }
  }

  /**
    Méthode principale de chargement des données des canons, prises soit dans
    la table des résultats produite par ruby soit dans le fichier canons.json
    produite par le travail sur les proximités.
  **/
  static async loadData(){
    this.reset()
    if ( fs.existsSync(this.jsonDataPath) ) {
      log.debug("* Chargement des données Canon depuis le fichier canons.json…")
      await IO.loadLargeJSONData(this,this.jsonDataPath)
    } else {
      log.debug("* Chargement des données Canons depuis la table de résultats…")
      this.set(PTexte.current.resultats.datas.canons.datas)
    }
    log.debug("= Données Canon chargées.")
  }

  static dispatchMotsEtProximites(){
    this.forEach(canon => canon.dispatchMotsEtProximites())
  }

  /**
    Pour ajouter une donnée depuis le fichier mots.json
  **/
  static addFromJSON(data) {
    let realData = {}
    for (var prop in this.properties ) {
      var propInFile = this.properties[prop]
      Object.assign(realData, {[prop]: data[propInFile]})
    }
    var icanon = new Canon(realData)
    Object.assign(this.items, {[icanon.id /* = .canon*/]: icanon})
    // console.log("Création du canon :", icanon)
  }

  /**
    Sauvegarde de tous les canons du texte courant, sous une forme que
    pourra recharger Proximit
  **/
  static saveData(){
    return IO.saveLargeJSONData(this, this.jsonDataPath)
  }

  // Chemin d'accès au fichier
  static get jsonDataPath(){return PTexte.current.in_prox('canons.json')}

  static reset(){
    this.items = {}
    delete this.current
  }

  // Quand on charge les données depuis la table des résultats produite par
  // l'analyse ruby (et non pas depuis le fichier canons.json)
  static set(datas) {
    // console.log("-> Canon.set()", datas.items)
    for ( var mot in datas.items ) {
      var canon = new Canon(datas.items[mot].datas)
      Object.assign(this.items, { [mot]: canon})
      canon.dispatchMots()
    }
  }

  // @return {Canon} le canon du mot +motstr+
  // Il doit exister ici sinon invoquer plutôt la méthode `Canon.of`
  static get(motstr){
    return this.items[motstr]
  }

  static forEach(fun){
    for (var canon in this.items ) {
      if ( false === fun(this.items[canon]) ) break ; // pour interrompre
    }
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
    | ATTENTION : pour créer le canon, il faut impérativement et explicitement
      mettre `options.create` à true
    | Si options et options.force est true, on demande le nom du canon. Sinon,
    | la méthode est @synchrone et on retourne null
  **/
  static of(motstr, options, callback){
    const my = this
    options = options || {}
    let canon = this.canonicFormOf(motstr)
    log.debug("forme canonique de '%s' : ", motstr, canon)
    if ( canon === "<unknown>") {
      if ( options.force === true ) {
        my.onSetCanon.poursuivre = callback
        prompt(`Impossible de trouver un canon pour le mot « ${motstr} ». Lequel dois-je utiliser ?`,{
          title: 'Canon introuvable'
          , buttons:[{text:"Le même", onclick:my.onSetCanon.bind(my,motstr)}, {text:"OK", onclick:my.onSetCanon.bind(my,null)}]
        })
      }
      return null
    } else {
      let theCanon = this.get(canon)
      log.debug("theCanon de '%s' = ", canon, theCanon)
      if ( undefined === theCanon ) {
        // Ce canon n'existe pas, il n'y aura donc aucun problème de proximité
        // avec ce mot, on peut le créer (mais c'est peut-être juste un check)
        if ( options.create === true) {
          let newCanon = this.createNew(canon)
          // On retourne ce canon
          return newCanon
        }
      }
      return theCanon
    }
  }

  /**
    Méthode appelée quand on doit définir explicitement le canon du mot, car
    il n'a pas été trouvé pas npl-js-tools-french ou tree-tagger-french.
  **/
  static onSetCanon(mot_init, can){
    const my = this
    let canon = mot_init || can // 'mot_init' est null, si on a défini le canon 'can'
    let newCanon = my.createNew(canon)
    if ( 'function' === typeof my.onSetCanon.poursuivre ) {
      my.onSetCanon.poursuivre(newCanon)
    }
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

  // Affiche le nombre exact de canons
  static showNombre(){
    UI.infos_proximites.find('#nombre_canons').innerHTML = Object.keys(this.items).length
  }


  /** ---------------------------------------------------------------------
    |
    | INSTANCES
    |
  **/
  constructor(data){
    // console.log("Canon.instance avec", data)
    this.data = data
    // console.log("data canon:", data)
    for ( var k in data ){
      if ( k === 'distance_minimale' )  ;
      else {
        switch(k){
          case 'mots':
          case 'proximites':
            this[`_${k}`] = data[k] ; break ;
          case 'distance_minimale': this._proxdistance = data[k]; break;
          // Les valeurs à passer
          case 'nombre_proximites': // sera calculé d'après la liste
            break ;
          default:
            this[k] = data[k]
        }
      }
    }
  }

  get id(){ return this.canon }

  /**
    Pour appliquer la fonction +func+ à tous les mots du canon

    Note : pour interrompre la boucle, il suffit que la fonction +func+
    retourne strictement `false`.

  **/
  forEachMot(func){
    for( var mot of this.mots ) {
      if ( false === func(mot) /* pour interrompre la boucle */ ) break
    }
  }

  /**
    À l'instanciation, quand les données viennent du fichier canons.json et
    non pas de la table de résultats ruby, il faut remplacer les listes d'id
    mots et proximites par des listes d'instances
  **/
  dispatchMotsEtProximites(){
    let firstMot = this.mots[0]
      , method   = 'number'==typeof(firstMot) ? Mot.get.bind(Mot) : Mot.add.bind(Mot)
    this._mots        = this.mots.map(method)
    this._proximites  = this.proximites.map(px_id => Proximity.get(px_id))
  }

  /**
    À l'instanciation, on peut demander à dispatcher les mots
    Retourne la liste des instances {Mot} créées et la met aussi dans
    this._mots
  **/
  dispatchMots(){
    // Maintenant qu'on appelle toujours `dispatchMotsEtProximites`
    this._mots = this.data.mots
    // var arr = []
    // for ( var id in this.data.mots ) {
    //   var mot = Mot.add(this.data.mots[id].datas)
    //   arr.push(mot)
    // }
    // this._mots = arr
    return this._mots
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

    Cela consiste à l'ajouter dans la liste des mots et la liste des
    offsets.

  **/
  addMot(imot){
    // console.log("Ajout du mot #%d au canon '%s'", imot.id, this.canon)
    // On commence par rechercher la place qu'il doit avoir
    var offoff = -1
    for ( var idx in this.offsets ) {
      if (this.offsets[idx] > imot.offset){ offoff = parseInt(idx,10)-1; break }
    }
    // On ajoute le mot dans la liste des mots et dans la liste des offsets
    if ( offoff < 0 ) {
      this._offsets .push(imot.offset)
      this._mots    .push(imot)
    }
    else {
      this._offsets .splice(idx, 0, imot.offset)
      this._mots    .splice(idx, 0, imot)
    }
    ++ this.nombre_occurences
    this.reinit()
  }

  /**
    Supprimer l'instance {Mot} +imot+ de ce canon (après suppression du mot
    dans le texte, par exemple).
  **/
  removeMot(imot){
    var idx;
    for ( idx in this.mots ) {
      if ( this.mots[idx].id == imot.id ) {
        idx = parseInt(idx,10)
      }
    }
    this.mots.splice(idx,1)
    this.offsets.splice(idx,1)
    -- this.nombre_occurences
    this.reinit()
  }

  reinit(){
    delete this._proximites
  }

  /**
    Retourne les proximités de ce canon.

    Noter que dans la table des résultats, cette donnée est enregistrée, mais
    ici, on la rend dynamique pour pouvoir tenir compte des modifications du
    canon et notamment du fait qu'une proximités peut être ajoutée ou modifiée.
  **/
  get proximites(){
    if ( undefined === this._proximites ) {
      this._proximites = []
      this.forEachMot( mot => {
        mot.proxP && this._proximites.push(mot.proxP.id)
        mot.proxN && this._proximites.push(mot.proxN.id)
      })
    }
    return this._proximites
  }
  get nombre_proximites(){ return this.proximites.length }

  /**
    Retourne true si le canon possède un mot qui pourrait être proche de
    l'offset +offset+ avec une grande tolérance.
  **/
  mayHaveNearMot(offset){
    const tolerance = this.proxDistance + 1500
    for ( var offcomp of this.offsets ) {
      if ( Math.abs(offcomp - offset) < tolerance ) {
        return true
      }
    }
    return false
  }

  /**
    Les propriétés qui doivent être sauvées dans les fichiers propres à
    proximit, c'est-à-dire ceux enregistrés en javascript lorsque des
    corrections (ou non, d'ailleurs) ont été exécutée.
    On en profite pour réduire la longueur des noms de propriétés afin
    d'obtenir des fichiers json beaucoup moins volumineux en cas de texte
    long, comme des romans.
  **/
  get properties(){ return this.constructor.properties }

  // Retourne les propriétés à sauver sous la forme d'une table json
  get forJSON(){
    let djson = {}
    for (var prop in this.properties ) {
      var val = this.getValFor(prop)
      if ( val === null || val === undefined ) continue ;
      var propInFile = this.properties[prop]
      Object.assign(djson, {[propInFile]: val})
    }
    return djson
  }

  /**
    Les valeurs étant presque toutes modifiées à l'instanciation du canon,
    il faut les recalculer pour les enregistrer
  **/
  getValFor(property){
    switch(property){
      case 'mots':        return this.mots.map(mot => mot.id)
      case 'proximites':
        return this.proximites.map(prox => {
          if ( prox ) { return prox.id }
          else {
            log.error("Problème avec la proximité ", prox)
            return undefined
          }
        })
      default:            return this[property]
    }
  }

}// Canon
