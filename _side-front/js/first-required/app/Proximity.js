'use strict'

const AROUND_LENGTH = 50

/**
  |
  | Classe Proximity
**/
class Proximity {

  /**
    On définit la valeur globale, qui est définie dans le fichier des
    résultats de l'analyse
  **/
  static set(datas){
    this.items = {}
    for(var idx in datas.items){
      Object.assign(this.items, {[idx]: new Proximity(datas.items[idx].datas)})
    }
  }

  /**
    Initialisation des proximités
  **/
  static init(itext){
    // l'indice de la proximité courante, affichée
    this.current_index = -1
    this.showInfos(itext)
    this.showButtons(itext)
  }

  /**
    | Affichage des infos de proximités du texte +itext+
  **/
  static showInfos(itext){
    UI.infos_proximites
      .clean()
      .append(Dom.createDiv({class:'bold', text:'Proximités'}))
      .append(rowData(null,"Nombre de proximités",itext.resultats.datas.proximites.datas.nombre))
      .append(rowData(null,"Nombre de mots",itext.resultats.datas.mots.datas.nombre_total_mots))
      .append(rowData(null,"Nombre de canons",itext.resultats.datas.canons.datas.nombre))
      .append(rowData(null,"Pourcentage proximités",itext.resultats.datas.proximites.datas.pourcentage))
      .append(rowData(null,"Proximités corrigés", "à voir"))
  }

  /**
    Affichage des boutons pour gérer les proximités
  **/
  static showButtons(itext){
    const my = this
    UI.buttons_proximites
      .clean()
      // .append(Dom.createDiv({text:"[Boutons]"}))
      // .append(Dom.createButton({text:"⏹⏸⏩⏪"}))
      .append(Dom.createButton({id:'btn-text-beginning', text:"⏮", title:"Début du texte"}))
      .append(Dom.createButton({id:'btn-text-end', text:"⏭", title:"Fin du texte"}))
      .append(Dom.createButton({id:'btn-save-corrections', text:"⏺", title:"Enregistrer les corrections"}))
      .append(Dom.createButton({id:'btn-prev-prox', text:"◀️", title:"Proximité précédente"}))
      .append(Dom.createButton({id:'btn-next-prox', text:"▶️", title:"Proximité suivante"}))

    // Il faut les surveiller
    $('button#btn-next-prox').on('click', my.showNext.bind(my))
    $('button#btn-prev-prox').on('click', my.showPrev.bind(my))
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
    if ( undefined === this.items[this.current_index + 1]){
      UI.message("FIN DU TEXTE")
      return
    }
    this.show(this.current_index += 1)
  }
  // Afficher la proximité d'index +idx+
  static show(idx){
    this.items[idx].show()
  }

  /**
    Boucle sur toutes les proximités
  **/
  static forEach(fun){
    for ( var idx in this.items ) {
      fun(this.items[idx])
    }
  }

  /**
    |
    | INSTANCE DE LA PROXIMITÉ
    |
  **/
  constructor(data){
    this.data = data
    // on dispatche les données
    for (var k in data) { this[k] = data[k] }
  }

  /**
    Méthode d'affichage de la proximité
  **/
  show(){
    var dataAround = this.textAround(500)
    var div = Dom.createDiv({class:'portion'})
    div.append(Dom.createSpan({text: dataAround.before}))
    div.append(Dom.createSpan({id:'before-word', text:dataAround.first_word, contentEditable:'true', class:'mot exergue'}))
    div.append(Dom.createSpan({text: dataAround.between}))
    div.append(Dom.createSpan({id:'after-word', text: dataAround.second_word, contentEditable:'true', class:'mot exergue'}))
    div.append(Dom.createSpan({text: dataAround.after}))
    UI.currentProximity
      .clean()
      .append(Dom.createDiv({text: `Proximité : « ${this.motA.mot} » ⇤ ${this.distance} ⇥ « ${this.motB.mot} » [offsets : ${this.motA.offset} ↹ ${this.motB.offset}]`}))
      .append(div)
    // Il faut observer les deux mots
    $("#before-word")
      .on('focus', this.motA.onFocus.bind(this.motA))
      .on('keypress', this.motA.onKeyPressed.bind(this.motA))
      .on('blur', this.motA.onBlur.bind(this.motA))
    $("#after-word")
      .on('focus', this.motB.onFocus.bind(this.motB))
      .on('keypress', this.motB.onKeyPressed.bind(this.motB))
      .on('blur', this.motB.onBlur.bind(this.motB))
  }

  // Retourne le texte comprendant les deux mots
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

    // Longueur de texte qui doit être prise
    const len = (this.motB.offset + this.motB.length) - this.motA.offset
    // Si une longueur minimale est définie, il faut voir si elle est atteinte
    // par l'intervalle entre les deux mots. Si ce n'est pas le cas, on
    // aggrandit ce qu'on doit prendre autour
    if ( undefined !== min && len < min) {
      addedLen = Math.round((min - len) / 2)
    }

    var meth = PTexte.current.getTextFromTo.bind(PTexte.current)
    var between = meth(this.motA.offset + this.motA.length, this.motB.offset)
    var first = this.motA.offset - (AROUND_LENGTH + addedLen)
    first >= 0 || (first = 0)
    var before  = meth(first, this.motA.offset)
    var start = this.motB.offset + this.motB.length
    var after   = meth(start, start + AROUND_LENGTH + addedLen)
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
        console.error("Impossible l'obtenir le mot d'index %d dans la liste : ", this.motB_id, Mot.items)
      }
    }
    return this._motB
  }

  get properties(){
    return {
        fixed:      {hname: "Proximité corrigée", values: [true,false]}
      , erased:     {hname: "Proximité supprimée", values: [true, false]}
      , ignored:    {hname: "Proximité à ignorer", values: [true, false]}
      , motA_id:    {hname: "Index du premier mot de la proximité"}
      , motB_id:    {hname: "Index du second mot de la proximité"}
      , distance:   {hname: "Distance entre les deux mots"}
      , distance_minimale: {hname: "Distance minimale de proximité (en deça, les mots sont en proximité)"}
      , created_at: {hname: "Date de création de cette proximité"}
      , updated_at: {hname: "Date de modification de cette proximité"}
    }
  }
}
