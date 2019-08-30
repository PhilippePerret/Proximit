'use strict'

/**
  Class WorkingTime
  -----------------
  Classe permettant de gérer le temps de travail sur le projet.

  Principe :
    Dès qu'on ouvre un projet, ou qu'on clique sur le bouton indiquant
    qu'on va travailler dessus, un chrono se met en route (en fait, on
    conserve simplement la date de départ) pour compter le temps de travail
    sur le projet ouvert. À la fin, quand on quitte ou quand on clique sur
    le bouton pour arrêter le chronomètre, l'application demande s'il faut
    ajouter le temps de travail au projet.
**/
class WorkingTime {

  /**
    |
    | INSTANCE
    |
    | Elle sert pour définir la valeur 'chrono' du projet
    |
  **/
  constructor(projet){
    this.projet = projet
  }

  init(){
    this.reset()
  }

  reset() {
    const my = this
    my.duration = 0
    my.ichrono  = 0
    my.projet.timer.removeClass('visible')
  }

  start(){
    const my = this
    my.reset()
    my.startedAt    = Number(new Date())
    my.timerChrono  = setInterval(my.playChrono.bind(my), 300)
    my.projet.timer.addClass('visible')
    my.running = true
  }
  clearTimer(){
    const my = this
    clearInterval(my.timerChrono)
    delete my.timerChrono
  }
  stop(){
    const my = this
    my.running = false
    my.clearTimer()
    my.addDuration()
    my.projet.chronometre.text('⏱')
    if ( confirm("Dois-je ajouter ce temps de travail au projet ?") ) {
      my.projet.addWorkingTime(parseInt(my.duration/1000))
    } else {
      this.reset()
    }
  }
  addDuration(){
    const my = this
    my.duration += Number(new Date()) - this.startedAt
  }

  playChrono(){
    ++ this.ichrono
    this.ichrono < 6 || (this.ichrono = 0)
    this.projet.chronometre.text(this.roto(this.ichrono))
    var d = this.s2h(parseInt((Number(new Date()) - this.startedAt)/1000,10))
    this.projet.timer.text(d)
  }

  // Prend un nombre de millisecondes et retourne l'horloge
  s2h(s){
    var h = Math.floor(s / 3600)
    s = s - h*3600
    var m = Math.floor(s / 60)
    m = `${m}`.padStart(2,'0')
    s = s - m*60
    s = `${s}`.padStart(2,'0')
    return `${h}:${m}:${s}`
  }
  roto(i){
    return ['🕐','🕒','🕔','🕖','🕘','🕚'][i]
  }

}
