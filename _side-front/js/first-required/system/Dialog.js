'use strict';
/**

  classe MDialog
  -------------
  version 1.0.0

  Requis :
    - dialog.css pour la mise en forme
    - img/icons/dialog/ et son contenu pour les images d'icones

  Les options envoyés correspondent en gros aux options de la méthode
  Dialog.showMessageBoxSync

    :buttons        Liste des boutons, de la gauche à la droite
                    Note : contrairement au fonction de la méthode native, on
                    met les boutons dans l'ordre où ils apparaissent.
                    ATTENTION : pour la méthode prompt et ask, il faut une liste
                    de *données boutons*, des tables qui contiennent au minimum
                    :text (texte du bouton) et :onclick, méthode à appeler quand
                    on clique sur le bouton. Noter qu'elle peut être fournie de
                    deux façons : soit comme string qui sera collé dans l'attribut
                    onclick de la balise, soit comme fonction (meilleur) qui
                    servira à l'observation du bouton.
                    La réponse donnée sera mise en dernier argument (donc certainement le
                    premier) des méthodes d'observer définies. Noter que si c'est
                    un string qui est fourni, on devra utiliser un autre moyen,
                    pas encore défini, pour obtenir la réponse donnée.
    defaultId:      Index du bouton par défaut (par défaut le dernier)
                    Note : contrairement au fonctionnement de la méthode native,
                    on compte les index à partir de 1 et à partir de la gauche.
                    Dans ["Cancel", "OK"], "Cancel" aura l'index 1 et "OK" aura
                    l'index 2.
    cancelId:       Index du bouton d'annulation (par défaut le premier)
                    Même note que ci-dessus.
    title:          Le titre de la boite de dialogue
    information:    Information supplémentaire (:detail, dans Dialog)
    checkbox:{:label, :checked} Pour ajouter une case à cocher
    icon:           Chemin d'accès à l'icône (if any)
    accessKeys:     true/false pour décider si on peut utiliser les touches
                    Le raccourci doit être ajouté au bout du bouton après une
                    esperluette. Par exemple : "Voir&v" permettra d'utiliser
                    CMD+V (Ctrl+v sur pc) pour activer le bouton.

    RETURN l'index du bouton choisi, 1-start à partir de la gauche (contraire-
    ment au fonctionnement de la méthode native).

  TODO
    - pour les prompt et ask, tenir compte des boutons par défaut aussi bien
      au niveau de l'aspect (btn-primary) qu'au niveau du fonctionnement (la
      touche ENTER doit permettre de l'activer). Idem pour cancel : la touche
      ESCAPE doit permettre de l'activer.

**/
function alert(msg, options){return MDialog.alert(msg, options)}
function notice(msg, options){return MDialog.notice(msg, options)}
function prompt(msg, options){return MDialog.prompt(msg,options)}
function ask(msg, options){return MDialog.ask(msg,options)}

const NodeJSDialog = require('electron').remote.dialog

class MDialog {
  static alert(msg, options){
    options = options || {}
    Object.assign(options, {type: 'alert'})
    return (new MDialog(msg,options)).show()
  }
  static notice(msg, options){
    options = options || {}
    Object.assign(options, {type: 'notice'})
    return (new MDialog(msg,options)).show()
  }

  /**
    Attention : pour ask et prompt, on utilise tout à fait
    autre chose.
  **/
  static prompt(msg, options){
    options = options || {}
    Object.assign(options, {type: 'prompt'})
    return (new HTMLDialog(msg,options)).show()
  }
  static ask(msg, options){
    options = options || {}
    Object.assign(options, {type: 'ask'})
    options.buttons || raise("Il faut définir les boutons, avec la méthode 'aks' !")
    return (new HTMLDialog(msg,options)).show()
  }


  constructor(msg, options){
    this.message = msg.replace(/\n/g,'<br>')
    this.options = options
  }
  // Ouvre le fenêtre
  show(){
    let params = {
        type:       this.dialType
      , title:      this.options.title
      , buttons:    this.buttonsList
      , defaultId:  this.defaultButtonId
      , cancelId:   this.defaultCancelId
      , message:    this.message
      , detail:     this.options.information
      , icon:       this.options.icon
      , normalizeAccessKeys: this.options.accessKeys || false
    }
    // Case à cocher
    this.options.checkbox && Object.assign(params, {checkboxLabel:this.options.checkbox.label, checkboxChecked:this.options.checkbox.checked})

    // console.log("params:",params)
    let res = NodeJSDialog.showMessageBoxSync(params)
    return this.nbButtons - res
  }

  get buttonsList(){
    if (undefined === this._buttonslist){
      if ( undefined === this.options.buttons ){
        this._buttonslist = ["OK", "Renoncer"]
      } else {
        this._buttonslist = this.options.buttons.reverse()
      }
    }
    // console.log("this._buttonslist = ", this._buttonslist)
    return this._buttonslist
  }
  get defaultButtonId(){
    if (undefined === this._defbtnid){
      if ( undefined === this.options.defaultId){
        this._defbtnid = 0
      } else {
        this._defbtnid = this.nbButtons - this.options.defaultId
      }
    }
    return this._defbtnid
  }
  get defaultCancelId(){
    if (undefined === this._defcancelid){
      if ( undefined === this.options.cancelId ) {
        this._defcancelid = this.nbButtons - 1
      } else {

        this._defcancelid = this.nbButtons - (this.options.cancelId)
      }
    }
    return this._defcancelid
  }
  get nbButtons(){return this.buttonsList.length}

  get TYPE2DIALTYPE(){return {'ask':'question', 'prompt':'question', '':'none', 'notice':'info', 'alert':'warning'}}

  get dialType(){
    if (undefined === this._dialtype){
      this._dialtype = this.TYPE2DIALTYPE[this.options.type]
    }
    return this._dialtype
  }
}// class MDialog





class HTMLDialog extends MDialog {
  constructor(msg, options){
    super(msg,options)
  }
  show(){
    this.build()
    this.observe()
  }
  remove(){
    this.jqObj.remove()
  }
  // Observation des boutons
  observe(){
    const my = this
    this.options.buttons.forEach( hbutton => {
      hbutton.onclick || raise("Il faut absolument définir tous les 'onclick' des boutons d'une boite de dialogue.")
      if ( 'function' === typeof hbutton.onclick ) {
        $(`button#btn-${hbutton.index}`).on('click', (ev)=>{
          hbutton.onclick.call(null, my.reponse)
        })
        $('button').on('click', my.remove.bind(my))
      }
    })
  }

  // Construction de la boite de dialogue
  build(){
    const my = this
    let opts = this.options
    this.dialogId = `dialog-${Number(new Date())}`
    // Valeurs par défaut
    opts.buttons || Object.assign(opts,{buttons:[{text:'OK', onclick:`UI.onClickOk.call(UI,'${this.dialogId}')`}]})
    // On affect un ID à chaque bouton, pour l'observer
    var bid = 0
    opts.buttons.forEach(hbutton => Object.assign(hbutton, {index:(bid += 1)}))
    opts.title   || Object.assign(opts,{title: `Message de Proximit`})
    opts.icon    || Object.assign(opts, {icon: 'question.png'})
    // On construit la boite
    var div = Dom.createDiv({class:'dialog', id:this.dialogId})
    div.append(Dom.createDiv({class:'title', text:opts.title}))
    div.append(Dom.create('IMG',{src:`img/icons/dialog/${opts.icon}`, class:'icon'}))
    div.append(Dom.createDiv({class:'message',text:this.message}))
    div.append(Dom.createInputText({id:`reponse-${this.dialogId}`}))
    var divBtns = Dom.createDiv({class:'buttons'})
    var onclick = null;
    opts.buttons.forEach(dbutton=>{
      dbutton.id = `btn-${dbutton.index}`
      if ( 'function' === typeof dbutton.onclick ) {
        onclick = dbutton.onclick
        delete dbutton.onclick
      } else {
        onclick = null
      }
      divBtns.append(Dom.createButton(dbutton))
      if ( onclick ) {
        Object.assign(dbutton, {onclick: onclick})
      }
    })
    div.append(divBtns)
    document.body.append(div)
  }

  get reponse(){return this.reponseField.val()}
  get reponseField(){return this.jqObj.find(`#reponse-${this.dialogId}`)}
  get jqObj(){return $(`#${this.dialogId}`)}
}
