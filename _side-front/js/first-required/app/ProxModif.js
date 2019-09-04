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
  // Instanciation avec l'instance {Mot} du mot modifié, et {String} la valeur
  // du nouveau mot.
  // Note : avant d'appeler cette instanciation, il faut s'assurer que les
  // mots sont différents.
  constructor(imot, newText){
    this.imot     = imot
    this.newText  = newText
    this.constructor.current = this
  }

  /**
    On procède à l'analyse de ce changement, c'est-à-dire l'impact qu'il
    aurait sur le texte actuel (création d'une nouvelle proximité par
    exemple ou absence de modification — pour un mot différent mais qui
    appartiendrait au même canon)
  **/
  analyze(){
    try {
      // Faire la liste des mots de remplacement, s'il y en a plusieurs.
      // La méthode retourne une liste d'instance Mot, ce qui permet d'avoir tout
      // de suite ce qu'il faut au niveau des tbw, etc.
      let mots = this.newText.split(' ') // pour le moment
      // TODO Mais ça ne suffit pas, de découper comme ça, car il pourra y
      // avoir des ponctuations et notamment des virgules ou des points.

      // Avant de procéder à quelconque changement, on doit vérifier
      // que le nouveau choix est valide ou confirmé par l'auteur
      if ( ! this.check_new_words(mots) ) return

      mots.forEach(motstr => this.analyze_single_word(motstr) )
      // Pour chacun des mots, même s'il n'y en a qu'un seul, il faut faire le test

    } catch (e) {
      console.error(e)
      // error(e.message)
    }
  }

  analyze_single_word(motstr){
    // On doit par trouver le canon du nouveau mot. Qu'il existe ou non,
    // la méthode Canon.of retourne une instance de {Canon} nouvelle ou
    // créée. Attention, la méthode Canon.of peut aussi retourner null
    // lorsqu'il faut demander le canon à l'utilisateur.
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
      var poursuivre = await my.check_new_word.call(my, mot, this.imot.offset + offs)
      if ( poursuivre === false ) {
        console.log("Je renonce au changement.")
        return
      } else {
        offs += mot.length + 1 // +1 pour l'espace
      }
    }
    console.log("Je vais procéder au changement")
  }
  /**
    Méthode qui vérifie le {String} +mot+.
    @async
    @return true si le mot est valide, false dans le cas contraire.
  **/
  check_new_word(mot, mot_offset){
    return new Promise((ok,ko)=>{
      // Forme canonique du mot
      // La méthode Canon.of, avec ces options, retourne null si
      // la forme canonique (lémmatisée) n'a pas pu être trouvée OU si ce canon
      // n'existe pas dans l'analyse courante.
      var canon = Canon.of(mot, {create:false, force:false})
      // Si un mot possède un canon qui est inconnu de l'analyse, il ne
      // peut pas rentrer en proximité avec d'autres mots
      if ( ! canon ){
        ok(true)
        return true
      }
      // Si le mot possède un canon connu de l'analyse, il faut voir s'il ne
      // rentre pas en proximité avec un de l'analyse autre que lui-même
      let motProche ;
      if ( motProche = canon.hasNearMot(mot_offset) ) {
        // Un mot proche a été trouvé, il faut demander ce qu'on doit faire
        ask("Un mot proche a été trouvé, dois-je poursuivre ?", {
          buttons:[{text:"Abandonner", onclick:ok(false)}, {text:"Poursuivre quand même",onclick:ok(true)}]
        })
      } else {
        ok(true/* pour poursuivre */) // pas de proximité trouvée
      }
    })
  }

  create_single_word_in_canon(motstr, canon){
    console.log("J'en arrive ici avec motstr='%s' et canon = ", motstr, canon)
    let newMot = Mot.createNew(motstr)
    console.log("newMot:", newMot)
    canon.addMot(newMot)
  }
}
