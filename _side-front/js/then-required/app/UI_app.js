'use string'
/**
  |
  | Définitions pour UI propres à l'application
  |
**/
Object.assign(UI,{
  name:'Extension de UI propre à l’application'

, forEachMotVisible(fun){
    for ( var mot of this.getMotsVisibles() ) {
      if ( false === fun.call(null,mot) ) break ; // pour interrompre
    }
  }
  /**
    Retourne la liste de tous les mots actuellement visibles
  **/
, getMotsVisibles(){
    this.waiter("Recherche des mots visibles…")
    let parent = UI.taggingField.domObj
      , pBounds = parent.getBoundingClientRect()
      , pStyle  = window.getComputedStyle(parent)
      , h = {
            pBounds:pBounds
          , pHeight: pBounds.height
          , pTopBorder: parseInt(pStyle['borderTopWidth'],10)
          , pTopPadding: parseInt(pStyle['paddingTop'],10)
          , pScroll:      parent.scrollTop
          , pSpace:       null
          , soust: null
        }
    h.soust = h.pTopBorder + h.pTopPadding
    h.pSpace = {from:h.pScroll, to:h.pHeight + h.pScroll}

    // On cherche le premier mot affiché
    let firstMot = null

    console.log(" h = ", h)

    if ( h.pScroll < 20 ) {
      firstMot = PTexte.current.firstMot
    } else {
      Mot.forEach( mot => {
        var oBounds = mot.domObj.getBoundingClientRect()
          , oTop    = mot.domObj.offsetTop - h.soust
          , oSpace  = {from:oTop, to:oTop+oBounds.height}
        if ( oSpace.from >= h.pSpace.from && oSpace.to <= h.pSpace.to ) {
          firstMot = mot
          return false // pour interrompre
        }
      })
    }
    firstMot || raise("Bizarrement, aucun premier mot n'a été trouvé")

    var mot = firstMot
      , motList = [firstMot]
    while ( mot = mot.motN ) {
      var oBounds = mot.domObj.getBoundingClientRect()
        , oTop    = mot.domObj.offsetTop - h.soust
        , oSpace  = {from:oTop, to:oTop+oBounds.height}
      if ( oSpace.to + 32 > h.pSpace.to ) {
        break
      } else {
        motList.push(mot)
      }
    } // Fin de la boucle

    this.stopWaiter()
    console.log("Liste des mots visibles : ", motList)
    return motList
  }
  /**
    Procédure de nettoyage de l'interface

    @param {Hash} params  Paramètres du nettoyage.
                          Si non défini, tout est nettoyé.
  **/
, clean(args){
    // args = args || {all: true};
    if ( undefined === args ) args = {all:true}
    ;(args.all || args.texte)        && this.cleanTexte()
    ;(args.all || args.infosProx)    && this.cleanInfosProximity()
    ;(args.all || args.infosProximites) && this.cleanInfosProximites()
    ;(args.all || args.infosDanger)  && this.cleanDangerProx()
    ;(args.all || args.messageProx)  && this.cleanMessageProx()
    ;(args.all || args.infosTexte)   && this.cleanInfosTexte()
  }
, cleanTexte(){UI.taggingField.clean()}
, cleanInfosProximity(){UI.infos_current_proximity.clean()}
, cleanDangerProx(){UI.infos_danger_proximity.clean()}
, cleanMessageProx(){UI.proxMessage.clean()}
, cleanInfosTexte(){UI.infos_texte.clean()}
, cleanInfosProximites(){UI.infos_proximites.clean()}

  /**
    Affichage des boutons pour gérer les proximités
  **/
, showButtonsProximites(itext){
    const my = this
    my.buttons_proximites
      .clean()
      // .append(Dom.createDiv({text:"[Boutons]"}))
      // .append(Dom.createButton({text:"⏹⏸⏩⏪"}))
      .append(Dom.createButton({id:'btn-first-prox', text:"⏮", title:"Première proximité visible"}))
      .append(Dom.createButton({id:'btn-last-prox', text:"⏭", title:"Dernière proximité visible"}))
      // .append(Dom.createButton({id:'btn-save-corrections', text:"⏺", title:"Enregistrer les corrections"}))
      .append(Dom.createButton({id:'btn-watch-loop', class:'pressable', text:"⤮", title:"Boucle automatique"}))
      .append(Dom.createButton({id:'btn-prev-prox', text:"◀️", title:"Proximité précédente"}))
      .append(Dom.createButton({id:'btn-next-prox', text:"▶️", title:"Proximité suivante"}))

    my.outils_proximites
      .clean()
      .append(Dom.createButton({id:'btn-ignore-prox', text:"#️⃣ <span class='tiny'>(ignorer)</span>", title:"Ignorer cette proximité"}))

    my.options_proximites
      .clean()
      .append(Dom.createCheckbox({id:'cb-sort-by-canon', text:"Afficher par canon"}))
      .append(Dom.createCheckbox({id:'cb-show-all-prox', text:"Tout afficher (même les ignorées)"}))

    // Il faut les surveiller
    $('button#btn-next-prox').on('click', Proximity.showNext.bind(Proximity))
    $('button#btn-prev-prox').on('click', Proximity.showPrev.bind(Proximity))
    $('button#btn-first-prox').on('click', Proximity.showFirst.bind(Proximity))
    $('button#btn-last-prox').on('click', Proximity.showLast.bind(Proximity))
    $('button#btn-ignore-prox').on('click', Proximity.ignoreCurrent.bind(Proximity))

    $('input#cb-sort-by-canon').on('click', Proximity.onCheckSortByCanon.bind(Proximity))
  }

  /**
    Construction de l'interface
    ----------------------------
    Mais en fait, maintenant, on la construit vraiment dans le fichier HTML
  **/
, build(){}
, observeApp(){
  }
})

Object.defineProperties(UI,{

  // Le bloc où écrire l'intégralité du texte
  texte:{get(){return this._texte || (this._texte = new UIObject('#full_texte'))}}

  // Le textarea qui contient le texte en chantier
, workingField:{get(){return this._workingfield ||(this._workingfield = new UIObject('textarea#working-text'))}}
  // L'espace à côté qui affiche le texte avec les proximités
, taggingField:{get(){return this._taggingfield ||(this._taggingfield = new UIObject('div#tagging-text'))}}


, proxMessage:{get(){
    return this._proxmsg || (this._proxmsg = new UIObject('#prox_message'))
  }}
, infos_danger_proximity:{get(){
    return this._infdangprox || (this._infdangprox = new UIObject('#infos_danger_proximity'))
  }}
, infos_current_proximity:{get(){
    return this._infcurprox || ( this._infcurprox = new UIObject('#infos_current_proximity'))
  }}
, buttons_proximites:{get(){
    return this._btnsprox || (this._btnsprox = new UIObject('#buttons_proximites'))}
  }
, outils_proximites:{get(){
    return this._proxtools || (this._proxtools = new UIObject('#outils_proximites'))}
  }
, options_proximites:{get(){
    return this._optsproxs || (this._optsproxs = new UIObject('#options_proximites'))}
  }
, infos_texte:{get(){
    return this._infos_texte || (this._infos_texte = new UIObject('#infos_texte'))}
  }
, infos_proximites:{get(){
    return this._infos_proximites || (this._infos_proximites = new UIObject('#infos_proximites'))}
  }
})
