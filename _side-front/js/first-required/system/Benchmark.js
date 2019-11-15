'use strict'
/** ---------------------------------------------------------------------
  *   Petit utilitaire pour benchmarquer des procédures
  *
*** --------------------------------------------------------------------- */

class Bench {
  static start(id){
    if(undefined === this.items) this.items = {}
    Object.assign(this.items, {[id]: new Bench(id)})
  }
  static stop(id){
    this.items[id].stop()
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(id){
    this.id = id
    this.start()
  }

  start(){
    this.startTime = Number(new Date().getTime())
    console.log("Départ de '%s' : %dms", this.id, this.startTime)
  }
  stop(){
    this.endTime = Number(new Date().getTime())
    console.log("Fin de '%s' : %dms", this.id, this.endTime)
    this.report()
  }
  report(){
    console.log("Durée de la procédure '%s' : %dms (%ss)", this.id, this.laps, this.lapsSeconds)
    return {laps:this.laps, lapsSeconds:this.lapsSeconds, start:this.startTime, end:this.endTime}
  }
  get laps(){
    return this._laps || (this._laps = this.endTime - this.startTime)
  }
  get lapsSeconds(){
    return this._lapsseconds || (this._lapsseconds = this.calcLapsSeconds())
  }
  calcLapsSeconds(){
    var lapsS = String(Math.floor(this.laps / 1000))
    lapsS += `.${this.laps % 1000}`
    return lapsS
  }
}
