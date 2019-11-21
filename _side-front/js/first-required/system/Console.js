'use strict'
/** ---------------------------------------------------------------------
  *   Console.js
  *   ----------
  *   Gestion de la console
  *
  *   Version 0.1.0

L'idée est de pouvoir travailler avec une application comme avec Vim,
en ligne de commande. Par exemple, au lieu de cliquer sur un bouton
"Enregistrer", on tape "w" et entrée dans la console.

Requis
------
  * console.css
  * system/utils.js (notamment pour les méthodes DOM)

*** --------------------------------------------------------------------- */
class Console {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *   C'est la console elle-même, tandis que les instances sont les
    *   les commandes.
  *** --------------------------------------------------------------------- */
  static get DIMCMD2CMD(){
    if (undefined === this._dimcmd2cmd) {
      this._dimcmd2cmd = {
          'w': {command:'write'}
        , 'r': {command:'read'},
      }
    } return this._dimcmd2cmd
  }
  static init(){
    this.obj.addEventListener('focus',  this.onFocus.bind(this))
    this.obj.addEventListener('blur',   this.onBlur.bind(this))
    this.obj.addEventListener('keyup',  this.onKeyup.bind(this))
  }
  static onFocus(){
    this.obj.classList.remove('discret')
    console.log("On va activer les touches")
  }
  static onBlur(){
    this.obj.classList.add('discret')
    console.log("On va désactiver les touches")
  }
  static onKeyup(ev){
    if ( ev.key == 'Enter') {
      new this(this.command).run()
      return stopEvent(ev)
    } else if ( ev.key == 'Escape') {
      // <= Touche escape
      // => Sortir de la commande active, if any
    } else {
      console.log("ev.key = ", ev.key)
    }
    return true
  }
  static get obj(){
    return this._obj || (this._obj = DGet('#console'))
  }
  static get command(){
    return this.obj.value
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
    * Une commande de la console, envoyée par la touche Enter
  *** --------------------------------------------------------------------- */

  constructor(command) {
    this.command = command
  }

  /**
    Pour jouer la commande voulue (this.command)
  **/
  run(){
    console.log("Commande à jouer : ", this.real_command)
  }

  get real_command(){
    if (undefined === this._realcmd) {
      let params = this.command.split(' ')
        , cmd = params.shift()
      if (Console.DIMCMD2CMD[cmd]) {
        // <= C'est un diminutif de commande connu
        this._realcmd = Console.DIMCMD2CMD[cmd]
        this._realcmd.params = params
      } else {
        // <= Ce n'est pas un diminutif de commande connu
        switch(cmd.substring(0,1)){
          case '/':
           params.unshift(cmd.substring(1,cmd.length))
           cmd = 'find';
           break;
          case '#':
            params.unshift(cmd.substring(1,cmd.length));
            cmd = 'goto';
            break
        }
        this._realcmd = {command:cmd, params: params}
      }
    }
    return this._realcmd
  }
}
