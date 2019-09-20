'use strict';
/**
  |
  | Class ProxModif
  | ------------
  | Gestion des modifications de proximité
  |
**/
class ProxModif {
  static get current()  { return this._current }
  static set current(v) { this._current = v }

  static reset(){
    delete this._current; this._current = undefined;
  }

  /**
    Méthode permettant de confirmer la proximité créée (en en corrigeant une
    autre). Toute les données se trouve dans ProxModif.current

    Cette méthode ne peut être appelée que lorsque pour supprimer une proximité
    on en a généré une nouvelle (volontairement ou involontairement).

  **/
  static confirmCurrent(){
    // console.log("Donnée de la modif :", this.current)

    // On supprime la proximité qui disparait (en fait, on doit faire le
    // même travail que lorsque le nouveau mot ne crée pas de problème)
    this.current.remplaceMot()

    // On ajoute la nouvelle proximité créée
    this.current.addProximity()

    // Il faut supprimer l'exergue des dangers
    Proximity.unshowDangers()

    // Il faut supprime le message
    UI.proxMessage.clean()

    UI.flash("Modification confirmée.", {style:'neutre', replace:true})
  }

  // Instanciation d'une modification de proximité demandée.
  // Note : avant d'appeler cette instanciation, il faut s'assurer que les
  // mots sont différents.
  /**
    | Instanciation d'une modification de proximité demandée
    |
    | @param {Mot}    imot    Le mot qui a été modifié. Pour savoir si c'est le
    |                         premier ou le second de la proximité, on se sert
    |                         de +isSecond+ ci-dessous.
    | @param {String} newText Le nouveau texte qui doit remplacé le mot (pas
    |                         forcément un mot unique)
    | @param {Bool}   iprox   Instance de la proximité concernée.
    |
  **/
  constructor(imot, iprox, newText){
    this.imot     = imot
    this.newText  = newText
    this.iprox    = iprox
    this.constructor.current = this
  }

  /**
    On procède à l'analyse de ce changement, c'est-à-dire l'impact qu'il
    aurait sur le texte actuel (création d'une nouvelle proximité par
    exemple ou absence de modification — pour un mot différent mais qui
    appartiendrait au même canon)

    La procédure d'analyse a deux formes :
      * une forme simple où un mot est remplacé par un seul autre mot
      * une forme complexe où le mot est remplacé par une suite de mots
    Les deux procédures sont traitées différemment, mais utilisent des méthodes
    communes.

    Cette méthode définit la propriété `this.isComplexModif` qui est true
    lorsque la forme est complexe.
  **/
  async treate(){
    // console.log("-> ProxModif.treate")
    var res

    // On supprime toutes les proximités qui auraient pu être mises en
    // exergue au cours d'une correction précédente.
    Proximity.unshowDangers()

    UI.proxMessage.clean()
    await UI.waiter('Recherche de proximités…', '#prox_message')

    // Avant toute chose, on conserve la trace de la proximité courante
    // pour pouvoir passer à la suite ensuite.
    const nextProximity = Proximity.sortedItems[Proximity.current_index+1]
    try {
      this.constructor.running = true // pour les tests

      // On traite en fonction de la complexité du remplacement
      this.isComplexModif = !!this.newText.match(' ')
      if ( this.isComplexModif ) {
        res = await this.traitement_complexe.call(this)
      } else {
        res = await this.traitement_simple.call(this)
      }

      // Quand la proximité a pu être corrigée, on passe directement
      // à la proximité suivante
      if ( res === true ){
        var curIdx = 0
        for ( var curIdx = 0, len = Proximity.sortedItems.length ; curIdx < len ; ++ curIdx ) {
          if ( Proximity.sortedItems[curIdx].id == nextProximity.id ) {
            Proximity.current_index = parseInt(curIdx,10)
            Proximity.show(Proximity.current_index)
          }
        }
      }
      // On ajoute une proximité corrigée
      ++Proximity.correctedCount
      // On actualise l'affichage
      Proximity.updateInfos()
    } catch (e) {
      throw e
    } finally {
      this.constructor.running = false // pour les tests
    }
  }

  async traitement_simple() {
    // console.log("-> ProxModif#traitement_simple")

    // Il faut d'abord s'assurer que le nouveau mot soit valide, c'est-à-dire
    // qu'il ne crée pas une nouvelle proximité qui ne serait pas validée
    // par l'auteur
    let choix = this.check_new_word()
    if ( ! choix ) return false
    UI.proxMessage.clean()

    this.remplaceMot()

    // console.log("<- ProxModif#traitement_simple")
    return true
  }

  remplaceMot(options) {
    const imot_id = this.imot.id

    // On détruit l'ancien mot, en récupérant son ID pour l'utiliser
    // NOTE : on doit le détruire avant de créer le nouveau, sinon cette
    // destruction détruirait en vérité le nouveau mot, et pas celui-ci
    // Note : cette destruction détruit aussi les proximités que le mot
    // peut entretenir et son appartenance au canon.
    // console.log("this.imot = ", this.imot)
    Mot.remove(this.imot)

    // On crée un nouveau mot avec le nouveau mot, en reprenant quelques
    // information de l'ancien mot, tel que son id, son offset
    this.createNewWord({
        mot:this.newText
      , id:this.imot.id
      , offset:this.imot.offset
      , rel_offset:this.imot.rel_offset
      , idP: this.imot.idP
      , idN: this.imot.idN
      , tbw: this.imot.tbw
    })

    // Là, il faut peut-être détruire vraiment imot
    delete this.imot

  }

  /**
    Lorsqu'on force une nouvelle proximité, il faut la gérer

    Note : c'est l'instance {Mot} this.newMot qui contient le nouveau
    mot créé.
    D'autres part, this.dangerData contient tout ce qu'il faut savoir sur
    la nouvelle proximité créée (avec le canon, etc.)
  **/
  addProximity(){
    // console.log("Données pour l'ajout de la nouvelle proximité : mot, et data", this.newMot, this.dangerData)
    const newMot = this.newMot
        , danger = this.dangerData

    let dataprox = {distance_minimale:danger.distanceMin, distance:null}
    if ( danger.prevMot ) {
      Proximity.create(danger.prevMot, newMot, Object.assign(dataprox,{distance:danger.prevDistance}))
    }
    if ( danger.nextMot ) {
      Proximity.create(newMot, danger.nextMot, Object.assign(dataprox,{distance:danger.nextDistance}))
    }
  }

  traitement_complexe() {
    try {
      // Faire la liste des mots de remplacement, s'il y en a plusieurs.
      // La méthode retourne une liste d'instance Mot, ce qui permet d'avoir tout
      // de suite ce qu'il faut au niveau des tbw, etc.
      let mots = this.newText.split(' ') // pour le moment
      // TODO Mais ça ne suffit pas, de découper comme ça, car il pourra y
      // avoir des ponctuations et notamment des virgules ou des points puisqu'il
      // sera possible de modifier beaucoup plus que le mot en proximité.
      // => Reprendre la procédure de traitement ruby de relève des mots.

      // Avant de procéder à quelconque changement, on doit vérifier
      // que le nouveau choix est valide ou confirmé par l'auteur
      if ( ! this.check_new_words(mots) ) return

      mots.forEach(motstr => this.analyze_single_word(motstr) )
      // Pour chacun des mots, même s'il n'y en a qu'un seul, il faut faire le test

      return true // absolument, en cas de réussite
    } catch (e) {
      console.error(e)
      // error(e.message)
    }
  }

  analyze_single_word(motstr){
    // On doit par trouver le canon du nouveau mot. Qu'il existe ou non,
    // la méthode Canon.of retourne une instance de {Canon} nouvelle ou
    // créée. Attention, la méthode Canon.of peut aussi retourner null
    // lorsqu'il faut demander le canon à l'utilisateur (dans ce cas-là, la
    // méthode devient asynchrone).
    let canon_newMot = Canon.of(motstr) // ~ @asynchrone
    // Si le canon n'a pas eu besoin d'être défini, on peut poursuivre
    if ( canon_newMot ) {
      this.create_single_word_in_canon(motstr, canon_newMot)
    }
  }

  /**
    Avant de procéder à quoi que ce soit, on doit s'assurer que
    l'auteur valide tous les choix, notamment lorsqu'il y a nouvelle
    proximité.
  **/
  async check_new_words(mots){
    const my = this
    var offs = 0
    for ( var mot of mots ) {
      var poursuivre = my.check_new_word.call(my, mot, this.imot.offset + offs)
      if ( poursuivre === false ) {
        // console.log("Je renonce au changement.")
        return
      } else {
        offs += mot.length + 1 // +1 pour l'espace
      }
    }
    // console.log("Je vais procéder au changement")
  }


  /**
    Méthode qui vérifie le {String} +mot+.
    @async

    @param {String} mot         Le mot vraiment
                                S'il n'est pas fourni, c'est la propriété
                                `newText` (traitement simple)
    @return true si le mot est valide, false dans le cas contraire.
  **/
  check_new_word(mot) {
    mot = mot || this.newText
    // Forme canonique du mot
    // La méthode Canon.of, avec ces options, retourne null si
    // la forme canonique (lémmatisée) n'a pas pu être trouvée OU si ce canon
    // n'existe pas dans l'analyse courante.
    var canon = Canon.of(mot, {create:false, force:false})
    // Si un mot possède un canon qui est inconnu de l'analyse, il ne
    // peut pas rentrer en proximité avec d'autres mots
    if (!canon){return true}

    // --- Si le mot possède un canon ---

    // Si le mot possède un canon connu de l'analyse, il faut voir si le mot
    // ne rentre pas en proximité avec un de l'analyse autre que lui-même
    let data_proxims = Proximity.for(mot, this.imot, canon)
    // console.log("data_proxims = ", data_proxims)
    if ( data_proxims.closestMot ) {
      // Un mot proche a été trouvé
      // Il faut l'indiquer à l'utilisateur en employant une autre couleur
      this.dangerData = data_proxims
      Proximity.showDanger(data_proxims)
      return false
    } else {
      // Pas de proximité dangereuse
      return true
    }
  }

  /**
    Méthode qui crée complètement un nouveau mot à partir des informations
    fournis par +mdata+
    @param {Hash} mdata   Les données à prendre en compte. Peut contenir :
                          mot:  Le mot simple, initial
                          canon   L'instance canon. Si elle n'est pas définie,
                                  elle sera recherchée.
  **/
  async createNewWord(mdata){
    if (undefined === mdata.canon) {
      let icanon = Canon.of(mdata.mot, {create:true}, this.addCanonToWordData.bind(this, mdata))
      // console.log("icanon = ", icanon)
      if ( !icanon ) return
      Object.assign(mdata, {canon: icanon})
    }

    // On remplace l'instance du canon par son texte
    const icanon  = mdata.canon
    mdata.canon   = mdata.canon.canon

    // On peut créer le mot
    this.newMot = Mot.createNew(mdata)
    // console.log("newMot:", newMot)
    icanon.addMot(this.newMot)

  }

  addCanonToWordData(mdata, icanon) {
    // console.log("icanon : ", icanon)
    Object.assign(mdata, {canon: icanon})
    this.createNewWord(mdata)
  }

}
