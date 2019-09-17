'use strict'

const DISTANCE_PROX_DEFAULT = 1500
const AROUND_LENGTH = 100 //200 // 50

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
    console.log("Proximités initialisées avec :", datas.items)
    this.reset()
    for(var idx in datas.items){
      var iprox = new Proximity(datas.items[idx].datas)
      iprox.id = parseInt(idx,10)
      Object.assign(this.items, {[idx]: iprox})
    }
  }

  /**
    Remise à zéro des proximités
  **/
  static reset(){
    this.items = {}
    this.semi_reset()
    UI.infos_proximites.clean()
    UI.buttons_proximites.clean()
  }

  /**
    Semi-réinitialisation, pour recalculer les valeurs volatiles
  **/
  static semi_reset(){
    this.current_index  = -1
    delete this._sortByCanon
    delete this._sorteditems
  }

  /**
    Initialisation des proximités
  **/
  static init(itext){
    // l'indice de la proximité courante, affichée
    this.current_index  = -1
    this.correctedCount = 0
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

  static updateInfos(){
    Proximity .showNombre()
    Proximity .showNombreCorrected()
    Canon     .showNombre()
    Mot       .showNombre()
  }

  static showNombre(){
    UI.infos_proximites.find('#nombre_proximites').innerHTML = Object.keys(this.items).length
  }
  static showNombreCorrected(){
    UI.infos_proximites.find('#corrected_proximites').innerHTML = this.correctedCount || 0
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
    if ( this.current_index + 1 >= this.sortedItems.length ){
      UI.message("FIN DU TEXTE")
      return
    }
    this.show(this.current_index += 1)
  }

  // Afficher la proximité d'index +idx+
  static show(idx){
    this.current_index = parseInt(idx,10)
    this.sortedItems[idx].show()
  }

  /**
    Méthode qui montre (en les mettant en exergue) les dangers d'une proximité
    entre deux mots. Prioritairement, cette méthode fonctionne avec les mots
    en édition (la proximité travaillé) mais on peut imaginer qu'elle puisse
    être utilisée avec n'importe quoi et n'importe quand.

    Noter que la méthode est susceptible d'ajouter des mots avant ou après dans
    le cas où la portion de texte affiché ne contiendrait pas les mots qui
    forment une proximité.

    @param {Hash} dataprox
                  Les données de la proximité. C'et la table qui est retournée
                  par 'Proximity.for' ci-dessous. Pour cette méthode, elle
                  contient principalement :
                  :modId    Identifiant du mot de référence, souvent le mot
                            édité.
                  :mot      {String} Le mot considéré
                  :nextMot  {Mot|Null} Le mot après qui est en proximité, s'il a
                            été trouvé, sinon null.
                  :prevMot  {Mot|Null} Le mot avant qui est en proximité, s'il a
                            été trouvé, sinon null.
                  :nextDistance {Number|Null} La distance avec le mot suivant.
                  :prevDistance {Number|Null} La distance avec le mot précédent.
  **/
  static showDanger(dataprox) {
    // console.log("-> Proximity.showDanger", dataprox)

    const container = $('div#current_proximity div.portion')

    // On enlève la classe 'danger' aux précédents mots mis en exergue
    container.find('.mot.danger').removeClass('danger')

    // Il faut mettre en exergue le mot dataprox.motId (celui qui a été changé)
    container.find(`.mot[data-id="${dataprox.motId}"]`).addClass('danger')

    // Ensuite il faut rechercher le ou les mots qui sont en proximité, en les
    // ajoutant avant ou après s'ils ne sont pas dans le texte courant.

    if ( dataprox.prevMot ) {
      const prevContainer = container.find('span#before-words')
          , idPrev = dataprox.prevMot.id

      // Il faut d'abord s'assurer qu'il soit visible. Si ce n'est pas le cas,
      // il faut afficher le texte jusqu'à ce mot
      var prevSelector = `.mot[data-id="${idPrev}"]`
        , prevObj = prevContainer.find(prevSelector)
      if ( prevObj.length == 0 ) {
        // <= Le mot n'est pas affiché
        // => Il faut remonter le texte en l'affichant jusqu'à ce mot
        // (en fait, on affiche depuis ce mot jusqu'au premier mot qu'on
        //  trouvera dans la page), auquel on ajoute cinq mots (pour le voir
        // dans son contexte)
        var imot = dataprox.prevMot
          , prevImot = null
          , nombrePMotsSup = 0
        while( imot && nombrePMotsSup < 5) {
          imot.asDom.reverse().forEach(span => prevContainer.insertBefore(span,prevImot) )
          if ( nombrePMotsSup > 0 || imot.id == idPrev ) ++ nombrePMotsSup
          prevImot = imot
          imot = Mot.get(imot.idP)
        }
        prevObj = prevContainer.find(prevSelector)
      }
      prevObj.addClass('danger')
    }
    if ( dataprox.nextMot ) {
      // Cf. le commentaire pour le mot précédent ci-dessus

      // Le container qui contient les mots après le second mot de la
      // proximité courante
      const nextContainer = container.find('span#after-words')
          , nextId = dataprox.nextMot.id

      var nextSelector = `.mot[data-id="${nextId}"]`
        , nextObj = nextContainer.find(nextSelector)
      if ( nextObj.length === 0 ) {
        var imot = dataprox.nextMot
          , lastImot = null
          , nombreNMotsSup = 0

        // On va boucler jusqu'à obtenir 5 mots supplémentaires (après avoir
        // affiché le mot recherché)
        while ( imot && nombreNMotsSup < 5 ) {
          imot.asDom.forEach( span => nextContainer.append(span) )
          if ( nombreNMotsSup > 0 || imot.id == nextId) { ++ nombreNMotsSup }
          imot = Mot.get(imot.idN)
        }
        nextObj = nextContainer.find(nextSelector)
      }
      nextObj.addClass('danger')
    }

    // Pour renseigner sur la proximité
    let proxInfo = [`avec`]
    if (dataprox.prevMot){
      proxInfo.push(`le mot précédent "${dataprox.prevMot.mot}" (#${dataprox.prevMot.id}) à ${dataprox.prevDistance} signes`)
    }
    if (dataprox.nextMot) {
      if (dataprox.prevMot) proxInfo.push('et')
      proxInfo.push(`le mot suivant "${dataprox.nextMot.mot}" (#${dataprox.nextMot.id}) à ${dataprox.nextDistance} signes`)
    }
    proxInfo = proxInfo.join(' ')
    UI.proxMessage(`Une nouvelle proximité a été trouvée ${proxInfo}.\nPour confirmer ce choix, cliquez sur « Confirmer ».\nDans le cas contraire, modifiez-la.`, 'warning')
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

  /**
    *** Cœur de la recherche de proximité ***

    Cette méthode retourne le mot (instance {Mot}) avec lequel +imot+ est en
    proximité dans le texte actuel.

    @param {String} str     Le mot qui doit être cherché
    @param {Mot}    fromId  L'ID du mot qu'on appelle "mot de référence", qui
                            est en général le mot que doit remplacer +str+. On
                            en a besoin pour connaitre le point de départ de la
                            recherche.
                            Si c'est une instance {Mot}, on prend son id
    @param {Canon}  canon   Optionnellement, on peut envoyer le canon du nouveau
                            mot s'il a déjà été calculé.

  **/
  static for(str, fromId, canon) {
    // Distance en dessous de laquelle on considère que les mots sont en
    // proximité
    console.log("-> Proximity.for(str,fromId,canon)",str,fromId,canon)

    // Le mot de référence
    // -------------------
    if ( fromId instanceof(Mot) ) fromId = fromId.id // I know, it's dumb…
    const imot = Mot.get(fromId)

    // Les données qui seront renvoyées
    let data_proxims = {
        motId: imot.id // on prend l'id seulement car le mot string est autre
      , mot: str
      , prevMot:null
      , prevDistance:null
      , nextMot:null
      , nextDistance:null
      , distanceMin:null
      , canon:null
    }

    // Le canon
    // --------
    canon = canon || Canon.of(str, {create:false, force:false})

    // Si le nouveau mot n'a pas de canon, il est inutile de lui chercher
    // une proximité.
    if ( ! canon ) return data_proxims

    Object.assign(data_proxims,{canon:canon, distanceMin:canon.proxDistance})
    const distanceMin = data_proxims.distanceMin

    // Si les occurences du canon ne sont pas trop nombreuses, on regarde si
    // les offsets sont susceptibles de provoquer des proximités. On considère
    // que c'est impossible lorsque qu'ils se trouvent à la distance minimale
    // du canon + 1500, la distance moyenne.
    // Noter que cette recherche est approximative dans le sens où le offset
    // du mot de référence est peut-être approximitif si le mot a été modifié
    // au cours de la session de travail.
    if ( canon.nombre_occurences < 20 && !canon.mayHaveNearMot(imot.offset) ) {
      // <= Toutes les occurences du canon sont beaucoup trop éloignées pour
      //    provoquer une proximité.
      // => On peut retourner les données (vides) tout de suite.
      return data_proxims
    }

    console.log("[Proximity.for] On doit boucler pour chercher une proximité.")

    // On boucle jusqu'à atteindre la distance minimum. Si un frère ou un
    // jumeau est rencontré, on interrompt la boucle
    // On commence par chercher avant, puis après
    var mot_checked = imot
    var cur_distance = 0
    while ( mot_checked && (mot_checked = mot_checked.motP) ) {
      cur_distance += mot_checked.full_length
      if ( cur_distance > distanceMin ) {
        // on a dépassé la distance minimale, on peut s'arrêter là
        break
      } else {
        // <= On est encore dans la distance minimale
        // => On doit voir si ce mot appartient au même canon.
        if ( mot_checked.canon === canon.canon ) {
          // <= Le mot checké et le mot testé ont le même canon
          // => C'est un jumeau ou un frère, il faut s'arrêter là.
          data_proxims.prevMot = Mot.get(mot_checked.id)
          data_proxims.prevDistance = cur_distance
          break
        }
      }
    }// fin de boucle tant qu'on trouve un mot avant

    console.log("data_proxims après la boucle en arrière : ", data_proxims)

    var mot_checked = imot
    var cur_distance = 0
    while ( mot_checked && (mot_checked = mot_checked.motN) ) {
      cur_distance += mot_checked.full_length
      if ( cur_distance > distanceMin ) {
        // on a dépassé la distance minimale, on peut s'arrêter là
        break
      } else {
        // <= On est encore dans la distance minimale
        // => On doit voir si ce mot appartient au même canon.
        if ( mot_checked.canon === canon.canon ) {
          // <= Le mot checké et le mot testé ont le même canon
          // => C'est un jumeau ou un frère, il faut s'arrêter là.
          data_proxims.nextMot = Mot.get(mot_checked.id)
          data_proxims.nextDistance = cur_distance
          break
        }
      }
    } // fin de boucle tant qu'on trouve un mot après et que la distance
      // minimum n'est pas atteinte

    console.log("data_proxims après la recherche en avant", data_proxims)

    // --- Le mot le plus proche (si les deux) ---
    // Pour terminer, on regarde quel est le mot le plus proche pour
    // renseigner closestMot
    if ( data_proxims.nextMot && data_proxims.prevMot ) {
      if ( data_proxims.nextDistance < data_proxims.prevDistance ) {
        data_proxims.closestMot = data_proxims.nextMot
      } else {
        data_proxims.closestMot = data_proxims.prevMot
      }
    }
    else if ( data_proxims.nextMot ) { data_proxims.closestMot = data_proxims.nextMot }
    else if ( data_proxims.prevMot ) { data_proxims.closestMot = data_proxims.prevMot }

    // Si les deux mots ont été trouvés, il faut les retourner avec la distance
    // qui les sépare.
    return data_proxims

  }

  /**
    Boucle sur toutes les proximités

    Un retour exactement égal à false de la fonction interrompt aussitôt
    la boucle
  **/
  static forEach(fun){
    for ( var idx in this.items ) {
      if ( false === fun(this.items[idx]) ) break ;
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
    // On détruit cette proximité dans les résultats
    // Note : peut-être que ça n'est pas nécessaire si on recalcule tout avec
    // d'enregistrer la donnée.
    RESULTATS.removeProximity(iprox)

    // Dans les items de Proximity
    // ---------------------------
    delete this.items[iprox.id]

    // Dans les instances des mots
    // ---------------------------
    // Supprimer la proximité 'next' du mot A
    delete motA._px_idN
    delete motA._proxN
    // Supprimer la proximité 'prev' du mot B
    delete motB._px_idP
    delete motB._proxP

    motA.icanon.reinit() // notamment pour forcer le recalcul des proximités

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


  /**
    Sauvegarde de tous les canons du texte courant, sous une forme que
    pourra recharger Proximit
  **/
  static save(){
    const my = this
    return new Promise((ok,ko)=>{
      let writeStream = fs.createWriteStream(my.jsonDataPath);
      writeStream.write(my.jsonData(), 'utf-8');
      writeStream.on('finish', () => {
          console.log('Toutes les proximités ont été écrites dans le fichier');
          ok()
      });
      writeStream.end();
    })
  }
  static jsonData(){
    var djson = Object.values(this.items).map(item => item.to_json)
    return '[' + djson.join(', ') + ']'
  }
  static get jsonDataPath(){return PTexte.current.in_prox('proximites.json')}


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
    div.append(Dom.createSpan({id:'word-before', text:dataAround.first_word, contentEditable:'true', class:'mot exergue', 'data-id':this.motA.id}))
    div.append(Dom.createSpan({id:'between-words', text: dataAround.between}))
    div.append(Dom.createSpan({id:'word-after', text: dataAround.second_word, contentEditable:'true', class:'mot exergue', 'data-id':this.motB.id}))
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
      between += `<span class="mot" data-id="${next_mot.id}">${next_mot.mot}</span>`
      between += next_mot.tbw
      next_mot = Mot.get(next_mot.idN)
    }
    // console.log("between = '%s'", between)

    // Reconstitution du texte avant
    var before = ''
    var before_len = 0
    // console.log("this.motA.idP = ", this.motA.idP)
    if ( undefined !== this.motA.idP ) {
      // <= Il y a un mot avant le premier mot
      // => On prend la longueur de texte voulue
      var motref = Mot.get(this.motA.idP)
      // console.log("motref:", motref)
      while ( motref && (before_len < AROUND_LENGTH + addedLen) ) {
        before = `<span class="mot" data-id="${motref.id}">${motref.mot}</span>` + motref.tbw + before
        before_len += motref.mot.length + motref.tbw.length
        motref = Mot.get(motref.idP)
      }
    }
    // console.log("Before = '%s'", before)

    // Reconstitution du texte après le second mot (motB)
    var after = this.motB.tbw
    var after_len = after.length
    if ( undefined !== this.motB.idN) {
      var motref = Mot.get(this.motB.idN)
      while ( motref && (after_len < AROUND_LENGTH + addedLen) ) {
        after += `<span class="mot" data-id="${motref.id}">${motref.mot}</span>` + motref.tbw
        after_len += motref.mot.length + motref.tbw.length
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

  /**
    Les propriétés qui doivent être sauvées dans les fichiers propres à
    proximit, c'est-à-dire ceux enregistrés en javascript lorsque des
    corrections (ou non, d'ailleurs) ont été exécutée.
    On en profite pour réduire la longueur des noms de propriétés afin
    d'obtenir des fichiers json beaucoup moins volumineux en cas de texte
    long, comme des romans.
  **/
  get properties(){
    return {
        'id':         'id'
      , 'ignored':    'i'
      , 'motA_id':    'ma'
      , 'motB_id':    'mb'
      , 'distance':   'd'
      , 'distance_minimale': 'dm'
      // Propriétés normalement inutile puisque la proximité est détruite
      , 'fixed':      'f' // inutile
      , 'erased':     'e' // inutile
    }
  }
  // Retourne les propriétés à sauver sous la forme d'une table json
  get to_json(){
    let djson = {}
    for (var prop in this.properties ) {
      var val = this[prop]
      if ( val === null || val === undefined ) continue ;
      var propInFile = this.properties[prop]
      Object.assign(djson, {[propInFile]: val})
    }
    return JSON.stringify(djson)
  }

}
