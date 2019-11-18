/** ---------------------------------------------------------------------
  *   TexteAnalyse
      ============

Je pars de tout à fait autre chose pour la version 0.3. Avec deux
procédures qu'il faudra évaluer pour choisir la meilleure :
NOTE : la seconde est obsolète puisqu'elle ne traite pas les caractères
spéciaux… (on en est encore à la préhistoire…)

On ouvre un texte quelconque. On l'analyse aussitôt
en utilisant la procédure ruby :
  - on enregistre le texte (*) dans un dossier provisoire
  - on demande à `analyse_texte.rb` de procéder à l'analyse du texte
  - on "remonte" les résultats et on les affiche dans le taggedPagesSection
  - on procède ainsi à intervalles réguliers ou à la demande.

en utilisant tree-tagger en interne
  - on passe le texte (*) par tree-tagger pour avoir son analyse
  - on affiche les résultats
  - on procède ainsi à intervalles réguliers ou à la demande

(*) Plus tard, pour un long texte, il s'agira de la version visible
    augmentée de ce qu'il y a autour suivant l'indice de proximité.
*** --------------------------------------------------------------------- */


class TexteAnalyse {

  /**
    Procède à l'analyze du texte +str+ (qui fait un maximum de 4500 signes)
  **/
  static async analyze(str){
    this.current = new this(str)
    // Pour benchmarker les deux
    // this.current.analyze({method:'ruby', callback:this.analyzeWithJS.bind(this)})
    await this.current.analyze({method:'ruby'})
  }

  /**
    Demande la construction du code HTML du texte, avec les mots marqués
    Retourne le texte taggé
  **/
  static tag(){
    return this.current.tag()
  }

  static analyzeWithJS(){
    this.current.analyze({method:'js'})
  }

  /**
    Affiche les résultats de l'analyse dans le taggedPagesSection quand l'analyse
    a été produite
  **/
  static showProximites(){
    this.current.showProximites()
  }

  /**
    Le texte courant
  **/
  static get current(){return this._current}
  static set current(v){
    this._current = v
  }

  /**
    Dossier dans lequel se fera l'analyse
  **/
  static get folder(){
    if ( undefined === this._folder){
      this._folder = path.join(App.ApplicationSupportFolder,'texteAnalysis')
      fs.existsSync(this._folder) || fs.mkdirSync(this._folder)
    }
    return this._folder
  }



  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(str){
    this.original = str
  }

  /**
    Procède à l'analyse du texte
    @param {Object} options
                      options.method    Méthode à utiliser (ruby par défaut)
                                        Autre valeur possible : 'js'
  **/
  analyze(options){
    console.log("-> TexteAnalyse#analyze")
    return new Promise((ok,ko)=>{
      options = options || {}
      options.method = options.method || 'ruby'
      this[`analyze_with_${options.method}`].call(this, ok)
    })
  }

  /**
    Taggue le texte, c'est-à-dire en retourne une version HTML avec
    la marque des proximités
  **/
  async tag(){
    return new Promise(async (ok,ko)=>{
      console.log("-> TexteAnalyse#tag")
      const Res   = this.rubyTableResultats
      const Data  = this.rubyData
      Res || raise("Il faut appeler l'analyse, avant de demander à tagguer le texte.")

      // Produit this.tableMots (qui contient les instances Mot des mots) et
      // this.firstMot (le premier mot du texte)
      console.log("--> Définition de la table de mots")
      await this.defineTableMots()
      console.log("<-- Retour de la Définition de la table de mots")

      var taggedText = DCreate('DIV')
      var mot = this.firstMot
      while(mot){
        // console.log("Mot as dom : ", mot.asDom)
        mot.asDom.forEach(domEl => taggedText.appendChild(domEl))
        mot = mot.motN
      }
      ok(taggedText)
    })
  }

  // @asynchrone
  defineTableMots(){
    const my = this
    return new Promise((ok,ko)=>{
      fs.readFile(this.whole_text_path,'utf-8', (err, str) => {
        if(err){
          return this.onError(err)
          ko()
        }
        my.wholeTexteData = JSON.parse(str)
        my.buildTableMots()
        ok()
      })
    })


    // Pour débug, données du texte complet, la donnée où on trouve
    // tous les mots, avec toutes leurs données.
    console.log("WholeTexte =", WholeTexte)

    // On transforme tous les mots en instance et on en profite pour
    // récupérer le premier, qui n'a pas de idP
  }

  buildTableMots(){
    const WholeTexte = this.wholeTexteData
    this.tableMots = {}
    var firstMotId = null
    Object.values(WholeTexte.datas.mots.datas.items).forEach( item => {
      var ditem = item.datas
      Object.assign(this.tableMots,{[ditem.id]: new Mot(ditem)})
      if (ditem.idP === null) { firstMotId = ditem.id }
    })
    this.firstMot = this.tableMots[firstMotId]
    Mot.items = this.tableMots
    console.log("Premier mot : ", this.firstMot)
  }

  get wholeTexteData(){ return this._wholetextedata }
  set wholeTexteData(v){ this._wholetextedata = v}
  /**
    Les méthodes d'analyse
  **/
  analyze_with_ruby(callback){
    this.callbackAfterAnalyzeWithRuby = callback
    Bench.start('analyse avec ruby',{verbose:true})
    fs.writeFile(this.path, this.original, this.afterWrittenText.bind(this))
  }
  afterWrittenText(err){
    const my = this
    if(err){
      alert("Une erreur est survenu au cours de l'écriture du texte. Consultez la console.")
      return console.error(err)
    }
    // Maintenant que le texte est écrit, on peut lancer l'analyse
    // execFile(`./bin/analyse_texte.rb`, [my.path], this.afterAnalyzeWithRuby.bind(this))
    let cmd = `./bin/analyse_texte.rb "${my.path}"`
    // console.log("Commande : ", cmd)
    exec(cmd) // synchrone
    this.afterAnalyzeWithRuby.call(this)
  }
  async afterAnalyzeWithRuby(err, stdout, stderr){
    Bench.stop('analyse avec ruby')
    if ( err ){ return this.onError(err) }
    console.log("Texte correctement écrit.")
    // ON charge le résultat de la recherche
    await this.loadTableResultats()
    await this.loadTableDatas()
    // this.rubyData = JSON.parse(fs.readFileSync(this.datas_path,'utf-8'))
    // console.log("Data retournées par ruby : ", this.rubyData)
    // On peut détruire entièrement le texte
    this.destroy()
    if (this.callbackAfterAnalyzeWithRuby){this.callbackAfterAnalyzeWithRuby()}
  }

  // Chargement asynchrone des résultas de l'analyse
  loadTableResultats(){
    const my = this
    return new Promise((ok,ko)=>{
      fs.readFile(this.resultats_path,'utf-8', (err, str) => {
        if(err) return this.onError(err)
        my.rubyTableResultats = JSON.parse(str)
        // console.log("Table de résultat par ruby : ", my.rubyTableResultats)
        ok()
      })
    })
  }

  // Chargement asynchrone des datas de l'analyse
  // Note : pour le moment, cette table ne sert pas
  loadTableDatas(){
    const my = this
    return new Promise((ok,ko)=>{
      fs.readFile(this.datas_path,'utf-8', (err, str) => {
        if(err) return this.onError(err)
        my.rubyData = JSON.parse(str)
        // console.log("Table des datas par ruby : ", my.rubyData)
        ok()
      })
    })
  }

  onError(err){
    alert("Une erreur est survenue. Consultez la console.")
    console.error(err)
    return false
  }
  /**
    Détruit le fichier et le dossier de son analyse (pour ne pas
    laisser de choses trainer)
  **/
  destroy(){
    // TODO
  }


  /**
    On procède à l'analyse, mais avec le node-module tree-tagger, tout en
    javascript. Le but de cette analyze est de produire la même table que
    la table remontée en ruby
  **/
  analyze_with_js(callback){
    console.log("-> analyze_with_js")
    this.callbackAfterAnalyzeWithJS = callback
    Bench.start('analyse avec javascript',{verbose:true})
    TreeTagger.analyze(this.original, this.afterAnalyzeWithJS.bind(this))
    console.log("<- analyze_with_js (@asynchrone)")
  }
  // Retour après l'analyze avec js
  // +tableLemma contient la liste des mots lémmatisés
  afterAnalyzeWithJS(tableLemma){
    console.log("-> afterAnalyzeWithJS")
    // ON peut récupérer le benchmark :
    let bench = Bench.get('TreeTagger')
    console.log("bench:", bench)
    // console.log("Durée de la lémmatisation : %d", bench.lapsSeconds)
    console.log("Table de lemma par JS : ", tableLemma)
    Bench.stop('analyse avec javascript')
    if (this.callbackAfterAnalyzeWithJS){this.callbackAfterAnalyzeWithJS()}
  }
  /**
    Retourne un path unique pour le fichier, qui sera détruit
  **/
  get path(){
    if (undefined === this._path){
      this._path = path.join(TexteAnalyse.folder, `${this.affixe}.txt`)
    } return this._path
  }
  get affixe(){
    return this._affixe || (this._affixe = String(Number(new Date().getTime())))
  }

  get resultats_path(){
    return this._resultats_path || (
      this._resultats_path = this.in_prox('table_resultats.json'))
  }
  get datas_path(){
    return this._datas_path || (this._datas_path = this.in_prox('data.json'))
  }
  get whole_text_path(){
    return this._whole_text_path || (this._whole_text_path = this.in_prox('whole_text.json'))
  }
  // Retourne une path dans le dossier proximit du texte
  in_prox(relpath){ return path.join(this.prox_folder, relpath) }
  get prox_folder(){return this._prox_folder || (this._prox_folder = path.join(this.folder,`${this.affixe}_prox`))}
  // Dossier contenant le texte (donc dans l'Application Support de l'application Proximit)
  get folder(){return this._textfolder || (this._textfolder = path.dirname(this.path))}
}
