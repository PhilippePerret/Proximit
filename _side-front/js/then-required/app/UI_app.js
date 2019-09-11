'use string'
/**
  |
  | Définitions pour UI propres à l'application
  |
**/
Object.assign(UI,{
  name:'Extension de UI propre à l’application'

  /**
    Affichage des boutons pour gérer les proximités
  **/
, showButtonsProximites(itext){
    const my = this
    my.buttons_proximites
      .clean()
      // .append(Dom.createDiv({text:"[Boutons]"}))
      // .append(Dom.createButton({text:"⏹⏸⏩⏪"}))
      .append(Dom.createButton({id:'btn-text-beginning', text:"⏮", title:"Début du texte"}))
      .append(Dom.createButton({id:'btn-text-end', text:"⏭", title:"Fin du texte"}))
      .append(Dom.createButton({id:'btn-save-corrections', text:"⏺", title:"Enregistrer les corrections"}))
      .append(Dom.createButton({id:'btn-prev-prox', text:"◀️", title:"Proximité précédente"}))
      .append(Dom.createButton({id:'btn-next-prox', text:"▶️", title:"Proximité suivante"}))

    // Il faut les surveiller
    $('button#btn-next-prox').on('click', Proximity.showNext.bind(Proximity))
    $('button#btn-prev-prox').on('click', Proximity.showPrev.bind(Proximity))
  }

, build(){
    // Pour les infos sur le texte
    UI.rightColumn.append(Dom.createDiv({id:'infos_texte', class:'container-data'}))
    UI.rightColumn.append(Dom.createDiv({id:'infos_proximites', class:'container-data'}))
    UI.middleColumn.append(Dom.createDiv({id:'buttons_proximites',class:'buttons'}))
    UI.leftColumn.append(Dom.createDiv({id:'current_proximity'}))
  }
})
Object.defineProperties(UI,{
  currentProximity:{get(){
    if (undefined === this._currentproximity){
      this._currentproximity = new UIObject('#current_proximity')
    }
    return this._currentproximity
  }}
, buttons_proximites:{get(){
    if (undefined === this._btnsprox){
      this._btnsprox = new UIObject('#buttons_proximites')
    }
    return this._btnsprox
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
