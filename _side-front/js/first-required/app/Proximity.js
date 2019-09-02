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
      .append(Dom.createDiv({text: `Proximité : « ${this.mot_avant.mot} » ⇤ ${this.distance} ⇥ « ${this.mot_apres.mot} » [offsets : ${this.mot_avant.offset} ↹ ${this.mot_apres.offset}]`}))
      .append(div)
    // Il faut observer les deux mots
    $("#before-word")
      .on('focus', this.mot_avant.onFocus.bind(this.mot_avant))
      .on('keypress', this.mot_avant.onKeyPressed.bind(this.mot_avant))
      .on('blur', this.mot_avant.onBlur.bind(this.mot_avant))
    $("#after-word")
      .on('focus', this.mot_apres.onFocus.bind(this.mot_apres))
      .on('keypress', this.mot_apres.onKeyPressed.bind(this.mot_apres))
      .on('blur', this.mot_apres.onBlur.bind(this.mot_apres))
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
    const len = (this.mot_apres.offset + this.mot_apres.length) - this.mot_avant.offset
    // Si une longueur minimale est définie, il faut voir si elle est atteinte
    // par l'intervalle entre les deux mots. Si ce n'est pas le cas, on
    // aggrandit ce qu'on doit prendre autour
    if ( undefined !== min && len < min) {
      addedLen = Math.round((min - len) / 2)
    }

    var meth = PTexte.current.getTextFromTo.bind(PTexte.current)
    var between = meth(this.mot_avant.offset + this.mot_avant.length, this.mot_apres.offset)
    var first = this.mot_avant.offset - (AROUND_LENGTH + addedLen)
    first >= 0 || (first = 0)
    var before  = meth(first, this.mot_avant.offset)
    var start = this.mot_apres.offset + this.mot_apres.length
    var after   = meth(start, start + AROUND_LENGTH + addedLen)
    return {
      before:before, first_word:this.mot_avant.mot, between:between, second_word:this.mot_apres.mot, after:after
    }
  }

  get mot_avant(){
    console.log("-> mot_avant (this.mot_avant_index=%d)", this.mot_avant_index)
    if (undefined === this._mot_avant){
      this._mot_avant = Mot.get(this.mot_avant_index)
      if ( ! this._mot_avant ) {
        console.error("Impossible l'obtenir le mot d'index %d dans la liste : ", this.mot_avant_index, Mot.items)
      }
    }
    return this._mot_avant
  }

  get mot_apres(){
    if (undefined === this._mot_apres) {
      this._mot_apres = Mot.get(this.mot_apres_index)
      if ( ! this._mot_apres ) {
        console.error("Impossible l'obtenir le mot d'index %d dans la liste : ", this.mot_apres_index, Mot.items)
      }
    }
    return this._mot_apres
  }

  get properties(){
    return {
        fixed: {hname: "Proximité corrigée", values: [true,false]}
      , erased: {hname: "Proximité supprimée", values: [true, false]}
      , ignored: {hname: "Proximité à ignorer", values: [true, false]}
      , mot_avant_index: {hname: "Index du premier mot de la proximité"}
      , mot_apres_index: {hname: "Index du second mot de la proximité"}
      , distance: {hname: "Distance entre les deux mots"}
      , distance_minimale: {hname: "Distance minimale de proximité (en deça, les mots sont en proximité)"}
      , created_at: {hname: "Date de création de cette proximité"}
      , updated_at: {hname: "Date de modification de cette proximité"}
    }
  }
}
