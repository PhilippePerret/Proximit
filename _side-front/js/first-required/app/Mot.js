'use strict'
/**
  |
  | Classe Mot
  |
  | pour les mots
**/
class Mot {

  static get properties(){
    return {
        'id':         'id'
      , 'idN':        'iN'
      , 'idP':        'iP'
      , 'file_id':    'f'
      , 'canon':      'c'
      , 'px_idN':     'pn'
      , 'px_idP':     'pp'
      , 'real_init':  'ri'
      , 'real':       'r'
      , 'downcase':   'd'
      , 'lemma':      'l'
      , 'sortish':    's'
      , 'tbw':        't'
      , 'offset':     'o'
      , 'rel_offset': 'ro'
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
      log.debug("* Chargement des données Mot depuis le fichier mots.json…")
      await IO.loadLargeJSONData(this,this.jsonDataPath)
      log.debug("= Données Mots chargées.")
    } else {
      log.debug("* Chargement des données Mots depuis la table de résultats… (donc par les canons)")
    }
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
    this.add(realData)
    // console.log("Création du mot :", imot)
  }

  /**
    Sauvegarde de tous les Mots du texte courant (instances Mot), sous une forme
     que pourra recharger Proximit
    @async
  **/
  static saveData(){
    return IO.saveLargeJSONData(this, this.jsonDataPath)
  }

  // Chemin d'accès au fichier JSON contenant les données mots lorsqu'elles
  // ont été enregistrées.
  static get jsonDataPath(){return PTexte.current.in_prox('mots.json')}

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
    Retourne l'instance Mot du mot d'après son objet DOM
  **/
  static getFromDom(o){
    return this.get(parseInt($(o).data('id'),10))
  }
  /**
    Ajoute le mot de données +dmot+ en le transformant en instance de mot
    @return {Mot} l'instance créée.
  **/
  static add(dmot) {
    if ( undefined !== dmot.datas) dmot = dmot.datas // depuis table résultats
    const mot = new Mot(dmot)
    if ( mot.id > this.lastId ) this.lastId = parseInt(mot.id,10)
    if ( null === mot._idP || undefined === mot._idP ) {
      if ( undefined === PTexte.current.firstMot ) {
        PTexte.current.firstMot = mot
      } else {
        if ( PTexte.current.firstMot.id == mot.id ) {
          // c'est le même, c'est un ajout du même mot
          log.error("Bizarrement, le mot '%s' (#%d) est ajouté deux fois…", mot.mot, mot.id)
        } else {
          // Là c'est vraiment une erreur avec deux mots qui n'ont pas d'idP
          throw new Error(`"Le texte comporte déjà un premier mot, il ne devrait pas en avoir deux (premier mot : "${PTexte.current.firstMot.mot}" (#${PTexte.current.firstMot.id}), autre mot sans idP : "${mot.mot}" (#${mot.id}))…`)
        }
      }
    }
    // console.log("Ajout du mot %d :", mot.id, mot)
    Object.assign(this.items, {[mot.id]: mot})
    return mot
  }


  /**
    Boucle la fonction +fun+ sur chaque mot
  **/
  static forEach(fun){
    for ( var motid in this.items ) {
      if ( false === fun(this.items[motid]) ) break ; // pour pouvoir interrompre
    }
  }
  /**
    Supprime le mot qui a pour instance {Mot} +imot+

    La destruction est complète, elle touche aussi les données qui contiennent
    ce mot, à commencer par les canons et les proximités.

  **/
  static remove(imot) {

    let motA = imot.proxP && imot.proxP.motA
      , motB = imot.proxN && imot.proxN.motB
      , proxAvantEtApresExiste = !!(motA && motB)

    // S'il est en proximité avec d'autres mots avant ou après, il faut
    // détruire cette proximité.
    imot.proxP && Proximity.remove.call(Proximity, imot.proxP)
    imot.proxN && Proximity.remove.call(Proximity, imot.proxN)

    if ( proxAvantEtApresExiste ) {
      // Si le mot à supprimer est en proximité avec un frère ou un jumeau
      // précédent, sa suppression va peut-être créer une nouvelle proximité
      // entre un éventuel frère ou jumeau suivant. Dans les deux cas, pour
      // que ce cas soit considéré, il faut que le mot possède une proximité
      // avant et après
      Proximity.createIfMotsProches(motA,motB)
    }

    // On détruit le mot dans l'affichage
    imot.domObj.remove()

    // On retire le mot de son canon
    imot.icanon.removeMot(imot)

    delete this.items[imot.id]
    // On détruit l'instance
    imot = undefined
    // À l'avenir, il faudra certainement réinitialiser des listes, comme
    // les listes de mots par classement alphabétique ou par nombre de proximi-
    // tés
    delete this._alphaSorted
    delete this._nbProxSorted

    // On actualise l'affichage
    Proximity.updateInfos()
  }

  /**
    Pour créer un nouveau mot à partir de +datamot+
  **/
  static createNew(datamot){
    if(undefined === datamot) datamot = {}
      // Note : ne devrait pas arriver, car datamot devrait toujours contenir
      // au moins la version string du mot et l'offset

    // console.log("Création du mot avec datamot = ", datamot)

    undefined !== datamot.id || Object.assign(datamot, {id: this.newId()})
    datamot.real_init || Object.assign(datamot, {real_init: datamot.mot})
    datamot.real      || Object.assign(datamot, {real: datamot.real_init})
    datamot.length    || Object.assign(datamot, {real: datamot.real_init.length})
    datamot.downcase  || Object.assign(datamot, {downcase: datamot.mot.toLowerCase()})

    // console.log("datamot pour la création du mot : ", datamot)
    let imot = new Mot(datamot)
    Object.assign(this.items, {[imot.id]: imot})
    // On doit l'ajouter à son canon
    imot.icanon.addMot(imot)
    return imot
  }

  // Retourne un nouvel identifiant
  static newId(){
    if (undefined === this.lastId) this.lastId = -1
    return (this.lastId += 1)
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

  /**
    Méthode appelée quand on focusse dans le champ éditable du mot
    On enclenche la surveillance des touches pressées (à moins qu'on la mette
    déjà avant)
  **/
  onFocus(iprox, ev){
    // console.log("-> onFocus, iprox = ", iprox)
    try {
      UI.select(ev.currentTarget)
      UI.select(ev.currentTarget)
      Proximity.currentMot = this
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
    // delete Proximity.currentMot //non, sinon on ne pourrait jamais rien faire dessus
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
  //  HELPERS

  get asDom(){
    return [
        Dom.create('SPAN',{text:this.mot, 'data-id':this.id, class:'mot'})
      , Dom.create('SPAN',{text:this.tbw.replace(/\r?\n/g,'<br>')})
    ]
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

  // Retourne la longueur "complète" du mot, c'est-à-dire sa longueur propre
  // à laquelle on ajoute la longueur des signes entre lui et le prochain
  // mot (tbw)
  get full_length(){
    return this._fulllen || (this._fulllen = this.length + (this.btw||'').length)
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
      var val = this[prop]
      if ( val === null || val === undefined ) continue ;
      var propInFile = this.properties[prop]
      Object.assign(djson, {[propInFile]: val})
    }
    return djson
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
