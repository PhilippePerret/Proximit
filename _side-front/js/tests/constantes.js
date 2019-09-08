'use strict';

Object.assign(TESTS,{
  /**
    Retourne le path absolu au texte de nom +texteName+ (qu'il existe ou non)
  **/
  pathOfTexte(texteName){
    return path.join(this.textesFolder,texteName)
  }

, get textesFolder(){
    return path.join(remote.app.getAppPath(),'spec','support','assets','textes')
  }
})
