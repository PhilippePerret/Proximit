'use strict'
/**
  Constante UI
  version 1.2.0
  ------------

  Requis :
    - UI.css

  # version 1.2.0
    Méthode 'select' qui permet de sélectionner tout élément, même
    un champ editableContent (donc autre que input-text ou textarea qui se
    sélectionnent simplement avec la méthode 'select')

  # version 1.1.2
    Correction du bug qui générait une erreur lorsqu'un message était
    demandé alors que le dernier flash n'était pas encore supprimé.

  # version 1.1.1
    Suppression de tout ce qui concernait l'application 'Projet'

  # version 1.1.0
    Ajout de UI.flash qui permet d'afficher des messages.

  # version 1.0.1
    Ajout de la méthode UI.message et de l'objet UI.footerMessage
    Pour afficher des messages en bas de page.
**/
const UI = {

  // Pour écrire un message dans le pied de page
  message(msg, style){
    this.flash(msg, style || 'notice')
  }
, error(msg){
    this.flash(msg, 'warning')
  }

, flash(msg, style){
    const my = this
    // Si un timer de destruction est en route, il faut l'interrompre
    my.flashTimer && this.clearFlashTimer()
    let divFlash = document.querySelector('#flash') || Dom.createDiv({id:'flash'})
      , divMsg   = Dom.createDiv({class:style||'notice', text:msg})
    divFlash.append(divMsg)
    document.body.append(divFlash)
    let nombre_mots = msg.split(' ').length
    if ( nombre_mots < 6 ) nombre_mots = 6
    let laps = 1000 * ( nombre_mots / 1.5 )
    my.flashTimer = setTimeout(()=>{
      let flash = document.querySelector('#flash')
      flash.classList.add('vanish')
      my.clearFlashTimer()
      my.flashTimer = setTimeout(()=>{
        flash.remove()
        my.clearFlashTimer()
      }, laps + 5000)
    }, laps)
  }
, clearFlashTimer(){
    const my = this
    clearTimeout(my.flashTimer)
    my.flashTimer = null
  }

, init(){
    if ('function' == typeof(this.build)) this.build.call(this)
    this.observe()

  }

, setDimensions(){
    const my = this
        , hwindow = window.innerHeight
        , hheader = UI.header.offsetHeight
        , hfooter = UI.footer.offsetHeight
        , innerHeight = `${hwindow - (hheader + hfooter)}px`
  }

, observe(){
  }

  /**
    Sélection l'élément DOM element quel qu'il soit.
  **/
, select(element){
    var range = new Range()
    range.setStart(element,0)
    range.setEnd(element,1) // TODO Si l'élément contient des noeuds, il faudra
                            // s'y prendre autrement, car là, seul le premier
                            // noeud sera pris en considération
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(range)
  }
  /**
    Rend visible l'élément +o+ {HTMLElement} dans son parent
  **/
, rendVisible(o) {
    let parent = o.parentNode

    let pBounds = parent.getBoundingClientRect()
      , parentStyle = window.getComputedStyle(parent)
      , oneTiers = pBounds.height / 3
      , twoTiers = 2 * oneTiers

    var h = {
          pBounds: pBounds
        , pHeight: pBounds.height
        , pBorderTop: parseInt(parentStyle['borderTopWidth'],10)
        , pPaddingTop: parseInt(parentStyle['paddingTop'],10)
        , oneTiers: oneTiers
        , twoTiers: twoTiers
    }
    h.soust = h.pBorderTop + h.pPaddingTop

    let oBounds = o.getBoundingClientRect()

    // let oTop =  oBounds.top - (pBounds.top + soust)
    let oTop    = o.offsetTop - h.soust
      , pScroll = parent.scrollTop
      , oSpace  = {from:oTop, to: oTop + oBounds.height}
      , pSpace  = {from:pScroll, to:h.pHeight + pScroll}

    // console.log({
    //   oBounds: oBounds
    // , hdata: h
    // , oSpace: oSpace
    // , pSpace: pSpace
    // })

    if ( oSpace.from < pSpace.from || oSpace.to > pSpace.to ) {
      var tscrol
      if ( oSpace.from < pSpace.from ) {
      //   // <= On est en train de monter et l'item se trouve au-dessus
      //   // => Il faut placer l'item en bas
      //   tscroll = oSpace.from + pBounds.height - oBounds.height
      tscrol = Math.round(oSpace.from - h.twoTiers)
      } else {
      //   // <= On est en train de descendre et l'item se trouve en dessous
      //   // => Il faut placer l'item en haut
      //   tscroll = oSpace.from
      tscrol = Math.round(oSpace.from - h.oneTiers)
      }
      // console.log("L'item est en dehors, il faut le replacer. Scroll appliqué :", tscrol)
      // parent.scrollTo(0, tscrol)
      parent.scroll({top: tscrol, behavior:'smooth'})
    }
  }


}
Object.defineProperties(UI,{
  body:{get(){return document.querySelector('body')}}
, header:{get(){return document.querySelector('section#header')}}
, footer:{get(){return document.querySelector('section#footer')}}
, footerMessage:{get(){return this.footer.querySelector('span#message')}}
, rightColumn:  {get(){return document.querySelector('section#right-column')}}
, middleColumn: {get(){return document.querySelector('section#middle-column')}}
, leftColumn:   {get(){return document.querySelector('section#left-column')}}
})
