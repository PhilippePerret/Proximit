'use strict'
/**
  Handy methods for Dom
  version 1.0.0
**/

/**
  Retourne une rangée pour un containeur de données de classe 'container-data'
  +coche+ peut avoir la valeur :
    null    Rien n'est marqué
    true    On coche en vert
    false   Une croix rouge

  Si +span_id+ est fourni, ce sera l'identifiant du code SPAN qui contient
  la valeur à donner à la rangée (souvent utile pour la modifier ou la lire)

  Note : le fichier CSS data.css est requis.
**/
function rowData(coche, label, value, span_id){
  var div = Dom.createDiv({class:'row-data'})
  var lab = Dom.create('LABEL')
  var coche = coche === null ? '' : (coche ? '✅' : '❌')
  lab.append(Dom.createSpan({class:'coche',text:coche}))
  lab.append(Dom.createSpan({text: label, class:'label'}))
  div.append(lab)
  div.append(Dom.createSpan({text:value, id:span_id}))
  return div
}
