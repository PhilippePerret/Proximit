'use strict'

const Aide = {
  name: 'aide'

/**
  Bascule l'aide
**/
, toggle(){
    if ( this.shown ) this.hide()
    else this.show()
    this.shown = !this.shown
  }
/**
  Méthode qui affiche l'aide
**/
, show(){
    this.domObj || this.build()
    this.domObj.style.display = 'block'
  }

/**
  Méthode qui masque l'aide
**/
, hide(){
    this.domObj.style.display = 'none'
  }

, build(){
    this.domObj = Dom.createDiv({id:'aide', text:this.content})
    let btnClose = '<a class="btn-close" onclick="Aide.toggle.call(Aide)">x</a>'
    this.domObj.prepend(Dom.createDiv({class:'right', text:btnClose}))
    UI.body.append(this.domObj)
  }
, get content(){
  // TODO Il faudrait que cette partie soit ailleurs pour pouvoir être utilisé
  // dans le scaffold des applications créées à partir de ce gabarit.
  // Et mettre ce module aide.js dans le dossier système de first-required
return `

<h2>Création des Projets</h2>

<p>Pour créer un projet, utiliser les boutons en bas à droite de la fenêtre de l'application.</p>


<h2>Sauvegarde</h2>

<h3>Dump de la base de données</h3>
<p>Toutes les données de la base peuvent être « dumpées », c'est-à-dire copiées dans un fichier backup en cliquant sur le bouton « Dump DB ». Cela produit un nouveau fichier avec la date du jour dans le dossier « backups » qui se trouve dans le dossier des supports de l'application.</p>

`
  }
}
