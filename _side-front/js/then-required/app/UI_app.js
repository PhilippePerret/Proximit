'use string'
/**
  |
  | Définitions pour UI propres à l'application
  |
**/
Object.assign(UI,{
  name:'Extension de UI propre à l’application'

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
, cleanTexte(){UI.texte.clean()}
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
      .append(Dom.createButton({id:'btn-save-corrections', text:"⏺", title:"Enregistrer les corrections"}))
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

, build(){
    // Pour les infos sur le texte
    UI.rightColumn.append(Dom.createDiv({id:'infos_texte', class:'container-data'}))
    UI.rightColumn.append(Dom.createDiv({id:'infos_proximites', class:'container-data'}))
    UI.middleColumn.append(Dom.createDiv({id:'buttons_proximites',class:'buttons'}))
    UI.middleColumn.append(Dom.createDiv({id:'outils_proximites', class:'buttons'}))
    UI.middleColumn.append(Dom.createDiv({id:'options_proximites', class:'buttons'}))
    UI.middleColumn.append(Dom.createDiv({id:'prox_message'}))
    UI.leftColumn.append(Dom.createDiv({id:'full_texte'}))
    UI.leftColumn.append(Dom.createDiv({id:'infos_current_proximity'}))
    UI.leftColumn.append(Dom.createDiv({id:'infos_danger_proximity'}))
  }
})

Object.defineProperties(UI,{

  // Le bloc où écrire l'intégralité du texte
  texte:{get(){return this._texte || (this._texte = new UIObject('#full_texte'))}}

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
    if (undefined === this._btnsprox){
      this._btnsprox = new UIObject('#buttons_proximites')
    }; return this._btnsprox
  }}
, outils_proximites:{get(){
    if (undefined === this._proxtools){
      this._proxtools = new UIObject('#outils_proximites')
    }; return this._proxtools
  }}
, options_proximites:{get(){
    if (undefined === this._optsproxs){
      this._optsproxs = new UIObject('#options_proximites')
    }; return this._optsproxs
  }}
, infos_texte:{get(){
    if ( undefined === this._infos_texte ) {
      this._infos_texte = new UIObject('#infos_texte')
    }
    return this._infos_texte
  }}
, infos_proximites:{get(){
    if(undefined===this._infos_proximites){
      this._infos_proximites = new UIObject('#infos_proximites')
    }
    return this._infos_proximites
  }}
})
