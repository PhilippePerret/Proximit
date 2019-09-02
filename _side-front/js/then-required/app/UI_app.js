'use string'
/**
  |
  | Définitions pour UI propres à l'application
  |
**/
Object.assign(UI,{
  name:'Extension de UI propre à l’application'
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
