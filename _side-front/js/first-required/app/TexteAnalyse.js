/** ---------------------------------------------------------------------
  *   TexteAnalyse
      ============

Je pars de tout à fait autre chose pour la version 0.3. Avec deux
procédures qu'il faudra évaluer pour choisir la meilleure :

On ouvre un texte quelconque dans le workingField. On l'analyse aussitôt
en utilisant la procédure ruby :
  - on enregistre le texte (*) dans un dossier provisoire
  - on demande à `analyse_texte.rb` de procéder à l'analyse du texte
  - on "remonte" les résultats et on les affiche dans le taggingField
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
  static analyze(str){
    this.current = new this(str)
    this.current.analyze({method:'ruby'})
    this.current.analyze({method:'js'})
  }

  /**
    Affiche les résultats de l'analyse dans le taggingField quand l'analyse
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
    options = options || {}
    options.method = options.method || 'ruby'
    this[`analyze_with_${options.method}`].call(this)
  }

  /**
    Les méthodes d'analyse
  **/
  analyze_with_ruby(){
    Bench.start('analyse avec ruby')
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
    console.log("Commande : ", cmd)
    exec(cmd) // synchrone
    this.afterAnalyzeWithRuby.call(this)
  }

  afterAnalyzeWithRuby(err, stdout, stderr){
    Bench.stop('analyse avec ruby')
    if ( err ){ return this.onError(err) }
    console.log("Texte correctement écrit.")
    // ON charge le résultat de la recherche
    var tableRes = JSON.parse(fs.readFileSync(this.resultats_path,'utf-8'))
    console.log("Table de résultat : ", tableRes)
    // On peut détruire entièrement le texte
    this.destroy()
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
  analyze_with_js(){
    Bench.start('analyse avec javascript')
    
    Bench.stop('analyse avec javascript')
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
      this._resultats_path = this.in_prox('table_resultats.json')
    )
  }
  // Retourne une path dans le dossier proximit du texte
  in_prox(relpath){ return path.join(this.prox_folder, relpath) }
  get prox_folder(){return this._prox_folder || (this._prox_folder = path.join(this.folder,`${this.affixe}_prox`))}
  // Dossier contenant le texte (donc dans l'Application Support de l'application Proximit)
  get folder(){return this._textfolder || (this._textfolder = path.dirname(this.path))}
}
