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
    return [
        Dom.create('SPAN',{text:this.mot, 'data-id':this.id, class:this.class})
      , Dom.create('SPAN',{text:this.tbw.replace(/\r?\n/g,'<br>')})
    ]
  }

  // Retourne le className de l'élément contenant le mot
  get class(){
    if (undefined === this._class){
      var c = ['mot']
      // Si le mot est en proximité, il faut le signaler
      if (this.px_idP || this.px_idN){c.push('proxdanger')}
      this._class = c.join(' ')
      c = null
    }
    return this._class
  }

  // Retourne l'objet DOM (pour le détruire ou le rendre éditable, par exemple)
  get domObj(){
    return UI.taggingField.find(`.mot[data-id="${this.id}"]`)
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

  // La proximité avec un mot avant (if any)
  get proxP(){
    if (undefined === this._proxP){
      this._proxP = this.px_idP ? Proximity.get(this.px_idP) : null
    }
    return this._proxP
  }

  // La proximité avec un mot après (if any)
  get proxN(){
    if (undefined === this._proxN){
      this._proxN = this.px_idN ? Proximity.get(this.px_idN) : null
    }
    return this._proxN
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
