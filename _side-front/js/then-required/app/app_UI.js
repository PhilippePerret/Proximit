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
    UI.rightColumn.append(Dom.createDiv({id:'infos_texte'}))
  }
})
Object.defineProperties(UI,{
  infos_texte:{get(){return $('#infos_texte')}}
})
