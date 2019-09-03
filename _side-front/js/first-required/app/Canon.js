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
    | Retourne la forme canonique du mot motstr sous forme d'instance {Canon}
    | Soit ce canon existe déjà soit il faut le créer maintenant pour le mot.
  **/
  static of(motstr){
    const my = this
    let canon = this.canonicFormOf(motstr)
    if ( canon === "<unknown>") {
      prompt(`Impossible de trouver un canon pour le mot « ${motstr} ». Lequel dois-je utiliser ?`,{
          title: 'Canon introuvable'
        , buttons:[{text:"Le même", onclick:my.onSetCanon.bind(my,motstr)}, {text:"OK", onclick:my.onSetCanon.bind(my,null)}]
      })
      return null
    }
    let iscan = this.get(canon)
    if ( undefined === iscan ) {
      // Ce canon n'existe pas, il faut le créer
      let newCanon = new Canon({
          canon: canon
        , proximites: []
        , mots:[]
        , nombre_occurences: 0
        , nombre_proximites: 0
      })
      // Il faut indiquer que ce canon est une nouvelle donnée à
      // prendre en compte pour le projet, nouvelle donnée qu'on doit
      // tout de suite enregistrer sur fichier.
      Addendum.addCanon(newCanon)
      return newCanon
    } else { return iscan }
  }

  /**
    Méthode appelée quand on doit définir explicitement le canon du mot, car
    il n'a pas été trouvé pas npl-js-tools-french ou tree-tagger-french.
  **/
  static onSetCanon(mot_init, can){
    canon = mot_init || can // 'mot_init' est null, si on a défini le canon 'can'
    // Il faut ajouter ce canon à la addendum
    // Addendum.addCanon(newCanon)
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
    for ( var k in data ) this[k] = data[k]
  }


  /**
    À l'instanciation, on peut demander à dispatcher les mots
  **/
  dispatchMots(){
    for ( var id in this.mots ) {
      Mot.add(this.mots[id].datas)
    }
  }
}
