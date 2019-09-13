'use strict'
/**
  |
  | Classe Mot
  |
  | pour les mots
**/
class Mot {

  static init(){
    this.reset()
  }

  static reset(){
    this.items  = {}
    this.lastId = -1
  }

  /**
    Retourne l'instance Mot du mot d'id +mot_id+
  **/
  static get(mot_id){
    return this.items[mot_id]
  }

  /**
    Ajoute le mot de données +dmot+ en le transformant en instance de mot
    @return {Mot} l'instance créée.
  **/
  static add(dmot) {
    const mot = new Mot(dmot)
    if ( mot.id > this.lastId ) this.lastId = parseInt(mot.id,10)
    // console.log("Ajout du mot %d :", mot.id, mot)
    Object.assign(this.items, {[mot.id]: mot})
    return mot
  }

  /**
    Supprime le mot qui a pour instance {Mot} +imot+
  **/
  static remove(imot) {
    delete this.items[imot.id]
    // On détruit l'instance
    imot = undefined
    // TODO À l'avenir, il faudra certainement réinitialiser des listes, comme
    // les listes de mots par classement alphabétique ou par nombre de proximi-
    // tés
    delete this._alphaSorted
    delete this._nbProxSorted
  }

  /**
    Définitions des mots
    On récupère la donnée +items+ du fichier de résultat
  **/
  static set(datas){
    // console.log("-> Mot.set()",datas)
    this.items = {}
    for (var mot in datas.items) {
      datas.items[mot].forEach( mot_id => {
        Object.assign(this.items, {[mot_id]: new Mot({mot:mot, id:mot_id})})
      })
    }
  }

  /**
    Pour créer un nouveau mot à partir de +datamot+
  **/
  static createNew(datamot){
    if(undefined === datamot) datamot = {}
      // Note : ne devrait pas arriver, car datamot devrait toujours contenir
      // au moins la version string du mot et l'offset

    undefined !== datamot.id || Object.assign(datamot, {id: this.newId()})
    datamot.real_init || Object.assign(datamot, {real_init: datamot.mot})
    datamot.downcase  || Object.assign(datamot, {downcase: datamot.mot.toLowerCase()})

    let imot = new Mot(datamot)
    Object.assign(this.items, {[imot.id]: imot})
    return imot
  }

  // Retourne un nouvel identifiant
  static newId(){
    if (undefined === this.lastId) this.lastId = -1
    return (this.lastId += 1)
  }

  /**
    |
    | INSTANCE DU MOT
    |
  **/
  constructor(data){
    this.data = data
    // console.log("data du mot : ", data)
    // on dispatche les données
    for ( var k in data ) { this[`_${k}`] = data[k] }
  }

  /**
    Méthode appelée quand on focusse dans le champ éditable du mot
    On enclenche la surveillance des touches pressées (à moins qu'on la mette
    déjà avant)
  **/
  onFocus(iprox, ev){
    // console.log("-> onFocus, iprox = ", iprox)
    try {
      UI.select(ev.currentTarget)
    } catch (e) {
      console.error(e)
    }

  }

  onKeyPressed(iprox, ev){
    if ( ev.key === 'Enter' ){
      ev.currentTarget.blur()
      return stopEvent(ev)
    }
  }
  /**
    Méthode appelée quand on blure du champ éditable contenant le mot.
    On vérifie s'il a été modifié et, si c'est le cas, on prend la modification
    et on regarde si elle crée d'autre problème (en les affichant sur le côté)
  **/
  onBlur(iprox, ev){
    // On désélectionne le texte s'il l'était
    document.getSelection().removeAllRanges();
    const new_mot = ev.currentTarget.innerText.trim()
    // console.log("Je blure du mot %s qui contient maintenant '%s'", this.mot, new_mot)
    if ( new_mot != this.mot ) {
      // <= Le mot a été modifié
      // => Il faut vérifier s'il crée un problème de proximité
      //    Il faut invoquer le module de modification PModif
      //    Si ça n'est pas le cas, on demande à l'utilisateur s'il veut
      //    l'enregistrer et considérer la proximité comme résolue.
      (new ProxModif(this, iprox, new_mot)).treate()
    }
  }

  // ---------------------------------------------------------------------
  //  PROPERTIES VOLATILES

  // La proximité avec un mot avant (if any)
  get proxP(){
    if (undefined === this._proxp){
      this._proxp = this.px_idP ? Proximity.get(this.px_idP) : null
    }
    return this._proxp
  }

  // La proximité avec un mot après (if any)
  get proxN(){
    if (undefined === this._proxn){
      this._proxn = this.px_idN ? Proximity.get(this.px_idN) : null
    }
    return this._proxn
  }

  get mot(){return this._real_init}

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
  get real()        {return this._real}
  // Version minuscule du mot
  get downcase()    {return this._downcase}
  // Forme lémmatisée du mot
  get lemma()       {return this._lemma}
  // Version du mot pour le classement
  get sortish()     {return this._sortish}
  // String entre ce mot et le mot suivant
  get tbw()         {return this._tbw}
  // Longueur du mot
  get length()      {return this._length}
  // Offset absolu (dans tout le texte)
  get offset()      {return this._offset}
  // Offset relatif (dans le document file_id)
  get rel_offset()  {return this._rel_offset}
  get file_id()     {return this._file_id}

  // Identifiant de la proximité avant (if any)
  get px_idP(){return this._px_idP}
  // Identifiant de la proximité après (if any)
  get px_idN(){return this._px_idN}
}
