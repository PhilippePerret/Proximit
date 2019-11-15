'use strict'

const DISTANCE_PROX_DEFAULT = 1500
const AROUND_LENGTH = 100 //200 // 50

/**
  |
  | Classe Proximity
**/
class Proximity {

  /**
    Méthode de chargement des informations. Soit elles sont prises depuis
    la table de résultats produite par ruby (première utilisation), soit
    elles sont prises du fichier proximites.json produit par Proximit en
    javascript après des premières corrections.

    L'alternative dépend de la présence ou non du fichier proximites.json
  **/
  static async loadData(){
    this.reset()
    if ( fs.existsSync(this.jsonDataPath) ) {
      log.debug("* Chargement des données depuis le fichier proximites.json…")
      await IO.loadLargeJSONData(this,this.jsonDataPath)
    } else {
      log.debug("* Chargement des données proximités depuis la table de résultats…")
      this.set(PTexte.current.resultats.datas.proximites.datas)
    }
    log.debug("= Données Proximity chargées.")
  }

  /**
    Les noms des propriétés de l'instance Proximity. La clé correspond à la
    valeur ici, dans le programme et la valeur correspond à la clé pour
    l'enregistrement dans le fichier, afin de prendre moins de place dans les
    gros textes.
  **/
  static get properties(){
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

  // Retourne la proximité d'identifiant +prox_id+
  static get(prox_id){return this.items[prox_id]}

  static newId(){
    if ( undefined === this.lastId ) this.lastId = 0
    return ++ this.lastId
  }
  /**
    On définit la valeur globale, qui est définie dans le fichier des
    résultats de l'analyse
  **/
  static set(datas){
    this.reset()
    var idx
    for(idx in datas.items){
      var iprox = new Proximity(datas.items[idx].datas)
      iprox.id = parseInt(idx,10)
      Object.assign(this.items, {[iprox.id]: iprox})
    }
    this.lastId = parseInt(iprox.id,10)
  }

  /**
    Quand la donnée vient du fichier proximites.json et non pas de la table
    de résultats produite par l'analyse ruby.

    Lorsque les données proximités viennent de l'analyse, elles sont lues
    et parsées par la méthode précédente `set`
  **/
  static addFromJSON(data) {
    let realData = {}
    for (var prop in this.properties ) {
      var propInFile = this.properties[prop]
      Object.assign(realData, {[prop]: data[propInFile]})
    }
    var iprox = new Proximity(realData)
    Object.assign(this.items, {[iprox.id]: iprox})
    if (iprox.id > this.lastId) this.lastId = parseInt(iprox.id,10)
    if ( iprox.ignored ) ++ this.ignoredCount

    // Compatibilité avec les anciennes versions
    if ( ! iprox.motA._px_idN ) {
      iprox.motA._px_idN = iprox.id
      iprox.motB._px_idP = iprox.id
    }

    // console.log("Création de la proximité :", iprox)
  }

  /**
    Remise à zéro des proximités
  **/
  static reset(){
    this.items  = {}
    this.lastId = 0 // pour commencer à 1
    this.ignoredCount   = 0
    this.correctedCount = 0
    this.addedCount     = 0
    this.semi_reset()
    UI.infos_proximites.clean()
    UI.buttons_proximites.clean()
  }

  /**
    Semi-réinitialisation, pour recalculer les valeurs volatiles
  **/
  static semi_reset(){
    this.current_index  = -1
    this.resetLists()
  }

  static resetLists(){
    delete this._sortByCanon
    delete this._sorteditems
  }

  /**
    Initialisation des proximités
  **/
  static init(itext){
    // l'indice de la proximité courante, affichée
    this.current_index  = -1
    delete this.current
    this.showInfos(itext)
    this.updateInfos()
    UI.showButtonsProximites(itext)
  }

  /**
    | Affichage des infos de proximités du texte +itext+
  **/
  static showInfos(itext){
    UI.infos_proximites
      .clean()
      .append(Dom.createDiv({class:'bold', text:'Proximités'}))
      .append(rowData(null,"Nombre de mots",'---','nombre_mots'))
      .append(rowData(null,"Nombre de canons",'---','nombre_canons'))
      .append(rowData(null,"Nombre de proximités",'---','nombre_proximites'))
      .append(rowData(null,"Pourcentage proximités",'---','pourcentage_proximites'))
      .append(rowData(null,"Proximités ignorées", '---','ignored_proximites'))
      .append(rowData(null,"Proximités corrigées", '---','corrected_proximites'))
      .append(rowData(null,"Proximités ajoutées", '---','added_proximites'))
  }

  static updateInfos(){
    Proximity .showNombre()
    Proximity .showPourcentage()
    Proximity .showNombreCorrected()
    Proximity .showNombreIgnored()
    Proximity .showNombreAdded()
    Canon     .showNombre()
    Mot       .showNombre()
  }

  static showNombre(){
    UI.infos_proximites.find('#nombre_proximites').innerHTML = this.realCount()
  }
  static showNombreCorrected(){
    UI.infos_proximites.find('#corrected_proximites').innerHTML = this.correctedCount
  }
  static showNombreIgnored(){
    UI.infos_proximites.find('#ignored_proximites').innerHTML = this.ignoredCount
  }
  static showNombreAdded(){
    UI.infos_proximites.find('#added_proximites').innerHTML = this.addedCount || 0
  }
  static showPourcentage(){
    UI.infos_proximites.find('#pourcentage_proximites').innerHTML = `${this.calcPourcentage()} %`
  }

  static count(){return Object.keys(this.items).length }

  // Le nombre de proximités en tenant compte des ignorées
  static realCount() { return this.count() - this.ignoredCount }

  /**
    Retourne le pourcentage de proximités

  **/
  static calcPourcentage(){
    return ( Math.round((this.realCount() / Mot.count())*1000) ) / 10
  }

  /**
    |
    | Pour afficher les proximités
    |
  **/

  // Doit montrer la première proximité
  static showFirst(){
    this.current_index = -1
    this.showNext()
  }
  // Doit montrer la dernière proximité
  static showLast(){
    this.current_index = this.sortedItems.length
    this.showPrev()
  }
  // La proximité visible précédente
  static showPrev(){
    // On cherche la précédente proximité qui serait affichable
    var chkidx = parseInt(this.current_index,10)
    chkidx -= 1
    if ( !this.optionAllProximites ) {
      while ( this.sortedItems[chkidx] && this.sortedItems[chkidx].ignored){
        -- chkidx
      }
    }
    // console.log("showPrev. current_index = %d", chkidx)
    if ( chkidx < 0 ){
      UI.flash("DÉBUT DU TEXTE", {style:'neutre',replace:true})
    } else {
      this.show(this.current_index = chkidx)
    }
  }
  static showNext(){
    // On cherche la prochaine proximité à afficher
    var chkidx = parseInt(this.current_index,10)
    ++ chkidx
    if ( !this.optionAllProximites ) {
      while ( this.sortedItems[chkidx] && this.sortedItems[chkidx].ignored){
        ++chkidx
      }
    }
    // console.log("showNext. current_index = %d", chkidx)
    if ( chkidx + 1 > this.sortedItems.length ){
      UI.flash("FIN DU TEXTE", {style:'neutre', replace:true})
    } else {
      this.show(this.current_index = chkidx)
    }
  }

  // Afficher la proximité d'index +idx+
  static show(idx){
    this.unshowDangers() // chaque fois
    if ( this.current ) this.unshowCurrent()
    this.current_index = parseInt(idx,10)
    this.current = this.sortedItems[idx]
    this.current.show()
  }

  static unshowCurrent(){
    this.current.unshow()
    delete this.current
  }

  /**
    | Méthode qui affiche (met en exergue) toutes les proximités visibles dans
    | la page
    |
  **/
  static showAllAround(){
    if ( this.allAreVisible ) {
      $('.mot.dblprox, .mot.prox-left, .mot.prox-right').each((i,o)=>{
        Mot.getFromDom(o).proxed = false
        o.style = ''
      })
      $('.mot.dblprox, .mot.prox-left, .mot.prox-right')
        .removeClass('dblprox')
        .removeClass('prox-left')
        .removeClass('prox-right')
      $('button#btn-show-all-prox').removeClass('pressed')
      this.allAreVisible = false
    } else {
      let motVisibles = UI.getMotsVisibles()
      let colorProps = ['border-color', 'color', 'background-color']
        , iprop = -1

      motVisibles.forEach( mot => {
        console.log("Traitement du mot '%s' (px_idN = %d)", mot.real, mot.px_idN, mot)
        if ( ! mot.proxN || mot.proxed ){
          console.log("Il n'a pas de proximité suivante")
          return
        }
        console.log("Il a une proximité suivante (#%d)", mot.proxN.id)
        // On ne traite que les mots qui possèdent une proximité suivante
        var color = Colors.next({onlyDark:true})
        console.log("Couleur à appliquer : '%s'", color)

        mot.domObj.classList.add('prox-right')
        mot.domObj.style = `border-color:${color};`
        var nextMot = mot.proxN.motB
        while ( nextMot ) {
          if ( nextMot.proxN ) {
            nextMot.domObj.classList.add('dblprox')
          } else {
            // Pas de mots suivant
            nextMot.domObj.classList.add('prox-left')
          }
          nextMot.proxed = true
          nextMot.domObj.style = `border-color:${color};`
          nextMot = nextMot.proxN && nextMot.proxN.motB
        }
      })
      $('button#btn-show-all-prox').addClass('pressed')
      this.allAreVisible = true
    }
  }

  // Pour ignorer (et donc passer) la proximité courante
  static ignoreCurrent(){
    if ( this.current ) {
      this.current.ignore.call(this.current)
      ++ this.ignoredCount
      this.showNombreIgnored()
    } else {
      UI.error("Il faut choisir la proximité à ignorer à l'aide des boutons ▶️ ou ◀️.")
    }
  }

  static unignore(prox_id){
    var iprox = this.get(prox_id)
    if ( iprox.ignored ) {
      iprox.ignored = false
      this.modified = true
      -- this.ignoredCount
      this.showNombreIgnored()
    } else {
      UI.error("Je ne peux pas désignorer une proximité qui n'est pas ignorée.")
    }
  }

  // On enlève la classe 'danger' aux précédents mots mis en exergue
  static unshowDangers(){
    $(UI.taggingField.findAll('.mot.danger')).removeClass('danger')
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

    this.unshowDangers()

    // Il faut mettre en exergue le mot dataprox.motId (celui qui a été changé)
    let refObj = UI.taggingField.find(`.mot[data-id="${dataprox.motId}"]`)
      , nearObj, nearDataId, nearSelector
    $(refObj).addClass('danger')

    nearDataId    = dataprox.prevMot ? dataprox.prevMot.id : dataprox.nextMot.id
    nearSelector  = `.mot[data-id="${nearDataId}"]`
    nearObj       = UI.taggingField.find(nearSelector)
    $(nearObj).addClass('danger')

    // Il faut la rendre visible (autant que possible)
    UI.rendVisible(nearObj, {smooth:false})
    UI.rendVisible(refObj, {fromTop: 10})

    // Pour renseigner sur la proximité
    let proxInfo = []
    if (dataprox.prevMot){
      proxInfo.push(dataprox.prevMot.mot, '⇤', dataprox.prevDistance, '→')
    }
    proxInfo.push(Mot.get(dataprox.motId).mot)
    if (dataprox.nextMot) {
      proxInfo.push('←', dataprox.nextDistance, '⇥', dataprox.nextMot.mot)
    }
    proxInfo.push(`<button type="button" class="warning" onclick="ProxModif.confirmCurrent.call(ProxModif)">Confirmer</button>`)
    UI.infos_danger_proximity.clean().append(proxInfo.join(' '))
    UI.proxMessage.append(`Nouvelle proximité trouvée. Pour confirmer ce choix, cliquez sur le bouton « Confirmer » ou corrigez-la.`, 'warning')
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
    // console.log("-> Proximity.for(str,fromId,canon)",str,fromId,canon)

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

    // console.log("data_proxims après la boucle en arrière : ", data_proxims)

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

    // console.log("data_proxims après la recherche en avant", data_proxims)

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
    // console.log("-> Proximity.onCheckSortByCanon")
    this._sortByCanon = document.querySelector('#cb-sort-by-canon').checked
    // Pour forcer le recalcul de la liste
    delete this._sorteditems
    this._sorteditems = undefined
    // Pour fonctionner vraiment bien, il faudrait mémoriser quel est la proximité
    // courante et régler le current_index pour que ça corresponde.

  }
  static get sortByCanon(){return this._sortByCanon || false}

  static get optionAllProximites(){
    return document.querySelector('#cb-show-all-prox').checked
  }

  /**
    Méthode qui crée une nouvelle proximité si les {Mot} mots +motAvant+ et
    +motApres+ sont en proximité
  **/
  static createIfMotsProches(motAvant, motApres){
    var dist = motApres.offset - motAvant.offset
      , distMin = motAvant.icanon.proxDistance
    if ( dist > distMin ) return ;
    // Si on passe là, c'est qu'il faut créer la proximité entre les deux
    // mot
    var args = {
        distance: dist
      , distance_minimale: distMin
      , dontRemoveCurProx: true // sinon, boucle sans fin
    }
    this.create(motAvant,motApres,args)
  }
  /**

    Méthode qui SUPPRIME LA PROXIMITÉ +iprox+

  **/
  static remove(iprox){
    // console.log("Destruction de la proximité :", iprox)

    const motA = iprox.motA
    const motB = iprox.motB

    // Il faut désactiver la proximité courante si c'est elle qui
    // est corrigée.
    if ( this.current && this.current.id === iprox.id) this.unshowCurrent()

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

    // On incrémente le nombre total de proximités corrigées (depuis
    // le départ du travail sur le texte, pas pour cette session seulement)
    ++ this.correctedCount

    // On actualise l'affichage
    this.updateInfos()

    // Marquer le texte modifié
    PTexte.current.modified = true

  }

  /**
    Méthode pour détruire le mot courant (qui appartient à la proximité courante)

    Noter que cela détruit la proximité courante, mais peut en provoquer une
    autre aussi.
  **/
  static async destroyCurrentMot(){
    // Vérifier que ce soit possible. C'est possible si une proximité courante
    // est affichée et si un de ses mots à été focussé
    // Rappel : le this.currentMot se règle quand on focusse dans le mot (cf.
    // la méthode 'Mot#onFocus')
    if ( ! this.current || ! this.currentMot ) {
      return UI.error("Il faut afficher une proximité et sélectionner le mot à supprimer.")
    }
    // Demander confirmation
    var dataAsk = {buttons:[
        {text:'Détruire le mot', onclick:Mot.remove.bind(Mot,this.currentMot)}
      , {text:'Renoncer', onclick:()=>{UI.message('Destruction abandonnée.')}}
    ]}
    await ask(`Voulez-vous vraiment détruire le mot « ${this.currentMot.mot} » ?`,dataAsk)
  }

  /**
    |
    | Méthode qui ajoute une proximité
    |
    | Et oui, ça peut le faire provisoirement, lorsqu'on fait un changement
    | plutôt complexe, ou alors qu'on remplace une proximité vraiment gênante
    | avec une proximité qui l'est moins (qui change de page, qui est proche de
    | la limite, etc.)
    |
    @param {Mot}  motA    Le mot avant (obligatoirement celui avant)
    @param {Mot}  motB    Le mot après (obligatoirement celui après)
    @param {Hash} params  Quelques paramètres requis ou optionnels
                  Requis
                  ------
                    :distance
                    :distance_minimale
                  Optionnels
                  ----------
                    :dontRemoveCurProx  Si cette valeur est à true, on ne touche
                                        pas aux proxN et proxP des mots. Cela
                                        est utile pour ne pas avoir une boucle
                                        sans fin.
  **/
  static create(motA, motB, params) {

    // console.log("-> Proximity::create(motA, motB, params)", motA, motB, params)

    if ( !params.dontRemoveCurProx ) {
      // Si le mot avant est déjà en proximité avec un mot après
      if ( motA.proxN ) this.remove( motA.proxN )
      // Si le mot après est déjà en proximité avec un mot avant
      if ( motB.proxP ) this.remove( motB.proxP)
    }

    // Les données pour créer une nouvelle proximité
    let dataNewProx = {
        id:       this.newId()
      , motA_id:  motA.id
      , motB_id:  motB.id
      , distance: params.distance
      , distance_minimale: params.distance_minimale
      , ignored:  false
      , erased:   false // inutile, mais bon…
      , fixed:    false // idem, mais bon…
    }

    // On instancie cette nouvelle proximité
    const newProx = new Proximity(dataNewProx)

    // L'ajouter à la liste des items
    Object.assign(this.items, {[newProx.id]: newProx})

    // On ajoute cette proximit aux deux mots
    motA._px_idN  = newProx.id
    delete motA._proxN
    motB._px_idP  = newProx.id
    delete motB._proxP
    // Ici, les _px_idN et _px_idP sont bien affectés, cela a été vérifié

    motA.icanon.reinit() // notamment pour forcer le recalcul des proximités
                          // motA et motB ont le même canon, fatalement

    // Pour vérifier
    // console.log("newProx = ", newProx)
    // console.log("motA, motB = ", motA, motB)

    // Réinitialiser les listes
    this.resetLists()

    // On ajoute une proximité ajoutée
    ++ this.addedCount

    // Incrémenter l'affichage (toutes les infos)
    this.updateInfos()
  }

  /**
    Sauvegarde de toutes les Proximités du texte courant, sous une forme que
    pourra recharger Proximit
  **/
  static saveData(){
    return IO.saveLargeJSONData(this, this.jsonDataPath)
  }

  static get jsonDataPath(){return PTexte.current.in_prox('proximites.json')}



  /** ---------------------------------------------------------------------
    |
    | INSTANCE DE LA PROXIMITÉ
    |
    | ---------------------------------------------------------------------
  **/
  constructor(data){
    this.data = data
    for (var k in data) { this[k] = data[k] }
  }

  /**
    Méthode appelée quand on active le bouton "Ignorer" sur la proximité
  **/
  ignore(){
    var cancelLink = Dom.createButton({onclick:`Proximity.unignore.call(Proximity,${this.id})`,text:'Annuler'})
    UI.flash(`Cette proximité est ignorée. ${cancelLink.outerHTML}`, {keep:true})
    this.ignored = true
    if ( Proximity.current.id === this.id ) Proximity.unshowCurrent()
    Proximity.modified = true
  }

  get spanA(){return UI.taggingField.find(`.mot[data-id="${this.motA.id}"]`)}
  get spanB(){return UI.taggingField.find(`.mot[data-id="${this.motB.id}"]`)}

  /**
    Méthode de désaffichage de la proximité, après son édition ou sa
    correction par exemple.
  **/
  unshow(){

    var mA = this.spanA
      , mB = this.spanB

    // Il faut leur mettre une classe distinctive
    $(mA).removeClass('exergue')
    mA.contentEditable = false
    $(mB).removeClass('exergue')
    mB.contentEditable = false

    // On supprime les infos sur la proximité

  }

  /**
    Méthode d'affichage de la proximité
  **/
  show(){

    // On sélectionne le premier mot
    var mA = this.spanA
      , mB = this.spanB

    // Il faut leur mettre une classe distinctive
    $(mA).addClass('exergue')
    mA.contentEditable = true
    $(mB).addClass('exergue')
    mB.contentEditable = true

    // Il faut la rendre visible (autant que possible)
    UI.rendVisible(mB, {smooth:false})
    UI.rendVisible(mA, {fromTop: 40})

    // Il faut afficher les infos sur cette proximités
    this.showInfos()

    // Il faut observer les deux mots
    $(mA)
      .on('focus', this.motA.onFocus.bind(this.motA, this))
      .on('keypress', this.motA.onKeyPressed.bind(this.motA, this))
      .on('blur', this.motA.onBlur.bind(this.motA, this))
    $(mB)
      .on('focus', this.motB.onFocus.bind(this.motB, this))
      .on('keypress', this.motB.onKeyPressed.bind(this.motB, this))
      .on('blur', this.motB.onBlur.bind(this.motB, this))
  }

  showInfos(){
    // console.log("this.motA = ", this.motA)
    let infos = `« ${this.motA.mot} » ← ${this.distance} → « ${this.motB.mot} » | dist.min : ${this.motA.icanon.proxDistance} | Offsets ${this.motA.offset} ↹ ${this.motB.offset}`
    UI.infos_current_proximity.clean().append(infos)
  }

  get motA(){
    // console.log("-> motA (this.motA_id=%d)", this.motA_id)
    if (undefined === this._motA){
      this._motA = Mot.get(this.motA_id)
      if ( ! this._motA ) {
        log.error("Impossible d'obtenir le mot d'ID %d dans la liste : ", this.motA_id, Mot.items)
      }
    }
    return this._motA
  }

  get motB(){
    if (undefined === this._motB) {
      this._motB = Mot.get(this.motB_id)
      if ( ! this._motB ) {
        log.error("Impossible d'obtenir le mot d'index %d dans la liste : ", this.motB_id, Mot.items)
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
  get properties(){return this.constructor.properties}

  // Retourne les propriétés à sauver sous la forme d'une table json
  // Dans cet enregistrements, les noms de propriétés sont toutes remplacées
  // par des noms courts sur une ou deux lettres max.
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

}
