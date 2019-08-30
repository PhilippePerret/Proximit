'use strict'
/**
  Class State
  -----------
  Gestion des états du projet
**/

class WithApp {
  static get DATA(){ return this._data || (this._data = this.getData())}

  /**
    Retourne un menu pour la propriété +prop+ du projet +projet+
    @param {String} prop    Propriété, 'state' par défaut
  **/
  static menuFor(projet, prop){
    return Dom.createSelect({value:this.selectValues, name:`projet-${projet.id}-${prop||'state'}`})
  }

  static get selectValues(){
    let values = []
    for(var k in this.DATA){ values.push([k, this.DATA[k].hname])}
    return values
  }

  static getData(){
    return {
        'finder':   {hname: 'Finder'}
      , 'atom':     {hname: 'Atom'}
      , 'textmate': {hname: 'TextMate'}
      , 'vim':      {hname: 'Vim'}
      , 'xterm':    {hname: 'Terminal'}
    }
  }
}
