'use strict';

/**
  |
  | Classe PTexte
  | ------------
  | Pour la gestion du texte complet en tant qu'entité Proximit
  |
**/
class PTexte {

  static get PAGE_LENGTH(){
    return this._page_length || Prefs.get('page_length') || PPage.PAGE_DEFAULT_LENGTH
  }

  /**
    | Retourne le PTexte courant
    | Il est défini après ouverture ou par rechargement, par défaut, du
    | dernier texte étudié.
  **/
  static get current(){return this._current}
  static set current(v){
    delete this._current
    this._current = v
  }

  /**
    Appelée quand on veut surveiller ou arrêter de surveiller le texte
    courant.
  **/
  static watchCurrent(){
    this.current[this.watchingCurrent?'stopWatching':'watch'].call(this.current)
    this.watchingCurrent = !this.watchingCurrent
  }

  /**
    Appelée quand on joue le menu "Fichier > Choisir le texte…", cette méthode
    permet de choisir un texte.
  **/
  static chooseText(){
    const my = this
    if ( this.current && this.current.modified ) {
      ask("Le texte courant a été modifié.\nVoulez-vous perdre les modifications ?",{
        buttons:[
            {text:'Renoncer',onclick:function(){UI.message('Opération annulée.')}}
          , {text:'Sauver le texte puis choisir', onclick:my.saveAndChooseText.bind(my)}
          , {text:'Perdre les changements', onclick:my.proceedChooseText.bind(my)}
        ]
      })
    } else {
      this.proceedChooseText()
    }
  }
  static async saveAndChooseText() {
    await this.current.save()
    this.proceedChooseText()
  }
  static proceedChooseText() {
    let choix = IO.choose({
      message:'Choisir le texte à analyser ou voir…',
      file:true, extensions:['odt','txt','text','rtf','doc','docx','md','scriv']
    })[0]
    if ( !choix ) return // aucun fichier choisi
    this.open(choix)
    Prefs.save()
  }

  /**
    Méthode qui procède vraiment à l'ouverture du texte de path +pth+
    Peut être appelée depuis le menu "Fichier > Ouvrir" ou le lancement de
    l'application.

    À l'ouverture d'un texte, on procède seulement à l'affichage de son
    état d'analyse et de correction (en tout cas pour le moment).
  **/
  static open(pth){
    log.debug("-> PTexte::open(%s)",pth)
    // Il faut tout réinitialiser
    this.reset()
    this.current = new PTexte({path: pth})
    this.current.open()
    log.debug("<- PTexte::open(%s)",pth)
  }

  static reset(){
    log.debug("-> PTexte::reset")
    delete this._current
    this.current = undefined
    UI.reset() // on nettoie tout
    Proximity.reset()
    Canon.reset()
    Mot.reset()
    log.debug("<- PTexte::reset")
  }

  /**
    Méthode appelée par le bouton ou le menu pour sauver le texte courant
    (toutes ses données)
  **/
  static saveCurrent(){ this.current.save() }

  /**
    Méthode appelée pour charger toutes les données du texte courant
    (quand elles ne viennent pas de ruby mais de javascript)

    Normalement, elle n'est appelée que pour un rechargement. Lorsque le
    texte est ouvert normalement, c'est la méthode d'instance 'init' qui
    s'occupe de tout charger.
  **/
  static loadCurrent(){ this.current.open() }

  static reloadCurrent(){
    if ( this.current ) {
      this.loadCurrent()
    } else {
      UI.error("Il faut d'abord choisir un texte à recharger !")
    }
  }

  static resetCurrent(){
    if ( this.current ) {
      var opts = {
        buttons: [
            {text:'Non', onclick:()=>{UI.message('Opération abandonnée','neutre')}}
          , {text:'OUI',onclick:this.proceedResetCurrent.bind(this)}
        ]
      }
      ask("La ré-initialisation consiste à revenir à la dernière analyse du texte.\n\nCette ré-initialisation va détruire toutes les modifications et corrections opérées.\n\nVoulez-vous vraiment procéder à cette opération ?", opts)
    } else {
      UI.error("Aucun texte courant à réinitialiser…")
    }
  }
  static async proceedResetCurrent(){
    await UI.waiter("Ré-initialisation complète du texte…")
    try {
      const ptexte = this.current
          , files  = ['mots.json','canons.json','proximites.json', 'corrected_text.txt']
      files.forEach( fname => {
        var fpath = ptexte.in_prox(fname)
        fs.existsSync(fpath) && fs.unlinkSync(fpath)
        fs.existsSync(fpath) && raise(`Le fichier "${fpath}" aurait dû être détruit…`)
        log.debug("Destruction du fichier '%s'", fname)
      })
    } catch (e) {
      console.error(e)
    } finally {
      UI.stopWaiter()
    }
  }

  /**
    |
    | Les différents états que peut avoir le texte
    |
    | Ce sont les différents états par lesquels passent le texte lorsqu'il
    | est étudié. Note : c'est surtout en back-side que ça sert.
  **/
  static get STATES(){
    return this._states || (this.states = App.getYAMLData('texte_states'))
  }

  static get OUTPUT_FORMATS(){
    return this._outputformats || (this._outputformats = App.getYAMLData('output_formats'))
  }

  /** ---------------------------------------------------------------------
    | INSTANCE
  **/
  constructor(data){
    for(var k in data) this[`_${k}`] = data[k] // data.path => this._path
    delete this.firstMot
  }

  /**
    Ouverture du texte courant
    --------------------------
    Depuis la version 0.3, on se contente de charger son texte dans le
    "working field"
  **/
  async open(){
    this.loading = true
    delete this.firstMot
    // UI.flash("Affichage du texte, merci de patienter…",{style:'neutre', keep:true, waiter:true})
    UI.waiter("Affichage du texte, merci de patienter…")

    // Préparation de l'interface pour ce texte
    this.setUI()

    // Création des pages du texte (cela produit la donnée this.pages) qui
    // liste toutes les pages du texte
    this.splitPages()

    // On met le texte de la page courante dans l'éditeur
    this.editWorkingTexte()

    // Écriture de l'état de l'analyse des proximités du texte
    this.writeState()

    this.inited = true

    UI.stopWaiter()
    UI.flash("Texte prêt à être travaillé.", {style:'neutre',replace:true})

    this.loading = false
  }

  // Pour surveiller le texte
  watch(){
    console.log("Je surveille le texte…")
  }
  stopWatching(){
    console.log("J'arrête de surveiller le texte.")
  }

  /**
    Réglage de l'interface
  **/
  setUI(){
    // Titre dans la barre de fenêtre
    DGet('head title').innerHTML = `${this.title} (version ${this.version})`
    this.setTexteHeight()
  }
  /**
    Fixe la hauteur du texte pour qu'il prenne toute la hauteur de l'interface
  **/
  setTexteHeight(){
    let wHeight = window.innerHeight
      , hTexte  = wHeight - (25 /* footer */ + 88 /* padding */ + 5 )
    $(UI.taggingField.domObj).css('height',`${hTexte}px`)
  }

  /**
    Découpe le texte courant en page, suivant les préférences de longueur
    de page.
  **/
  splitPages(){
    PPage.split(this.fullTextInFile, this)
  }
  /**
    Met le texte tel quel dans le champ d'édition
  **/
  async editWorkingTexte(){
    const my = this
    PPage.current = this.currentPage
  }

  /**
    Retourne la page courante (celle affichée)
  **/
  get currentPage(){
    if (undefined === this._currentpage){
      this.indexCurrentPage = 0
      // TODO Plus tard, on pourra mettre la dernière page retenue dans les
      // données du texte.
      this._currentpage = this.pages[this.indexCurrentPage]
    } return this._currentpage
  }
  set currentPage(v){this._currentpage = v}

  /**
    Appelée lorsque le texte de l'éditeur a changé (mais après un
    laps de temps, ce qui permet de ne pas interrompre la frappe)
  **/
  onChange(ev){
    this.editor.save(data => console.log("nouvelles data:", data))
  }

  /**
    Sauvegarde de toutes les données courantes

    Note : cette méthode ne sauvent pas dans les mêmes fichiers que
    l'analyse ruby. Ici, on utilise mots.json, canons.json, proximites.json
    et corrected_text.txt (et peut-être d'autres fichiers à l'avenir)
  **/
  async save(){
    log.info("Enregistrement des données, merci de patienter…",{style:'warning', keep:true, waiter:true})
    console.time('Sauvegarde')
    log.debug("*** SAUVEGARDE DE L'ANALYSE DU TEXTE '%s'…", this.name)
    log.debug("* Sauvegarde des données mots…")
    await Mot       .saveData()
    log.debug("  = OK (mots)")
    log.debug("* Sauvegarde des données Canons…")
    await Canon     .saveData()
    log.debug("  = OK (canons)")
    await Proximity .saveData()
    await this      .saveTexte()
    this.saveData()
    log.info("=== DONNÉES PROXIMIT SAUVEGARDÉES AVEC SUCCÈS ===")
    console.timeEnd('Sauvegarde')
    UI.flash("Fin de la sauvegarde", {style:'neutre', replace:true})
  }

  /**
    Sauvegarde de tous les canons du texte courant, sous une forme que
    pourra recharger Proximit
  **/
  saveTexte(){
    const my = this
    return new Promise((ok,ko)=>{
      let writeStream = fs.createWriteStream(my.correctedTextPath);
      writeStream.write(my.correctedText, 'utf-8');
      writeStream.on('finish', () => {
          log.debug('Toutes les proximités ont été écrites dans le fichier');
          ok()
      });
      writeStream.end();
    })
  }
  get correctedTextPath(){return this.in_prox('corrected_text.txt')}

  /**
    | ---------------------------------------------------------------------
    |   VERSIONS
    |
  **/

  /**
    Permet de changer de version

    On enregistre ce changement dans les données (data.json) afin de pouvoir
    notamment surveiller si on fait assez de sauvegarde des fichiers.

  **/
  async newVersion(){
    const Versioning = require('./js/modules/versioning.js')
    let dataNewVersion = {
        folder:     this.prox_folder
      , extensions: 'json'
      , excludes:   ['whole_text.json', 'table_resultats.json']
    }
    let newVersion = await Versioning.new(this, dataNewVersion)
    UI.flash(`La nouvelle version ${newVersion} a été appliquée.\n(l'ancienne est sauvegardée dans 'xversions').`, {style:'neutre', replace:true})
    this.saveData()
  }
  get version(){ return this._version || this.getVersion() }
  set version(vers) {
    this._version = vers
    fs.writeFileSync(this.pathVersion, vers)
    $('.texte-version').html(vers)
  }
  get pathVersion(){return this.in_prox('VERSION')}
  getVersion(){
    if ( fs.existsSync(this.pathVersion)) {
      return fs.readFileSync(this.pathVersion, 'utf-8')
    } else {
      return '0.0.0'
    }
  }

  /**
    Méthode, à l'ouverture, qui regarde si la dernière version n'est pas trop
    lointaine.
  **/
  checkLastVersionDate(){
    let lastDate = Number(this.dateLastVersion)
      , now = Number(new Date())
      , diff = (now - lastDate) / 1000 // pour l'avoir en secondes
      , nombre_jours = diff / (24 * 3600)
    if ( nombre_jours > 5 ) {
      UI.error("La dernière version date d'il y a plus de 5 jours. Ne serait-il pas temps de passer à la suivante ?")
    }
  }

  // Retourne la date de la dernière version
  get dateLastVersion(){
    if ( this.datas.dateVersion ) {
      return new Date(this.datas.dateVersion)
    } else {
      var d = new Date(this.datas.created_at)
      if ( d == 'Invalid Date' ) d = new Date(this.datas.created_at.split(' ')[0])
      return d
    }
  }

  // /Fin des méthodes version
  // ---------------------------------------------------------------------

  /**
    Retourne le texte intégral corrigé
    Attention, ce texte peut être immense (tout un livre)
  **/
  get correctedText(){
    var fulltext = ''
    var curMot = this.firstMot
    while ( curMot ) {
      fulltext  = fulltext.concat(curMot.mot, (curMot.tbw||''))
      curMot    = curMot.motN
    }
    log.debug("LONGUEUR TEXTE RETOURNÉ : %d", fulltext.length)
    return fulltext
  }

  get dataPath(){ return this.in_prox('data.json') }

  /**
    Retourne le texte du fichier contenant le texte entier (texte_entier.txt)
    TODO Il faut vérifier si on tient compte ici des versions de corrections.
    (dans le cas où on enregistre le texte avec des numéros de version différent à chaque fois)
  **/
  get fullTextInFile(){
    var t = String(fs.readFileSync(this.fulltext_path))
    // console.log("Texte dans le fichier = ", t)
    return t
  }

  /**
    |
    | Méthode pour corriger les proximités
    |
  **/
  correctProximities(){
    // Vérifier qu'on puisse le faire
    if ( undefined === this.resultats ){
      return UI.error("Le texte n'a pas encore été analysé. On ne peut pas afficher ses proximités. Jouer le menu « Texte > Analyser… »")
    }
    // console.log("résultats : ", resultats)
    // console.log("Proximités:", proximites)
    // let proximites = this.resultats.datas.proximites.datas
    this.initWhenAnalyzed()
    Proximity.show(0)
    // Affichage de la première proximité
  }

  /**
    Méthode, utilisée normalement à l'ouverture du fichier, écrivant l'état
    de travail sur le texte, pour savoir jusqu'à quel point il a été analysée
    et corrigé.
  **/
  writeState () {
    UI.infos_texte.clean()
    const analyzed = this.isAnalyzed
    UI.infos_texte.append(analyzed?"Le texte a été analysé":"Le texte n'a pas encore été analysé.")
    // Le nom du texte (affixe)
    this.writeRowInfo(true, 'Nom du texte', this.affixe)
    // La version
    this.writeRowInfo(fs.existsSync(this.pathVersion),"Version courante", this.version)
    // Note : même si le texte n'a pas encore été analysé, on affiche l'état
    // de présence des fichiers pour infos.
    // Existence du dossier affixe_prox
    this.writeRowInfo(analyzed, `Dossier proximit`, path.basename(this.prox_folder))
    if ( analyzed ) {
      // Le dossier Proximit existe, on regarde ce qu'il contient pour
      // voir ce qu'on peut faire.
      this.writeRowInfo(null, "Date dernière analyse", humanDateFor(this.analyse_date,/*short=*/true))
    } else {
      this.writeRowInfo(null, "Analyse et correction", "Il faut lancer l'analyse de ce texte.")
    }
    this.writeRowInfo(fs.existsSync(this.fulltext_path), "Fichier du texte complet", "OK")
    this.writeRowInfo(fs.existsSync(this.resultats_path), "Fichier intégral des résultats", "OK")
    this.writeRowInfo(null, "Dernier ID de mot", Mot.lastId)
  }

  writeRowInfo(coche, label, value){
    UI.infos_texte.append(rowData(coche,label,value))
  }


  /**
    | ---------------------------------------------------------------------
    | Propriétés volatiles
  **/

  get resultats() {
    if ( undefined === this._resultats ) {
      if (fs.existsSync(this.resultats_path)){
        // Si on "require", pour les tests, la donnée ne sera pas reprise
        // depuis les fichiers, ce qui entrainera des faux négatifs lorsque
        // les résultats auront été modifiés. Il faut donc toujours forcer
        // la lecture depuis le fichier (ce qui, de toute façon, ne mange pas
        // de pain)
        // this._resultats = require(this.resultats_path)
        this._resultats = JSON.parse(fs.readFileSync(this.resultats_path,'utf-8'))
      }
    }
    return this._resultats
  }

  // Retourne la date de la dernière analyse, si le texte a été analysé
  get analyse_date(){
    if ( ! this.isAnalyzed ) return
    return new Date(this.resultats.datas.created_at)
  }

  // Retourne true si le texte a été analysé
  get isAnalyzed() { return !!fs.existsSync(this.prox_folder) }

  /**
    Propriétés de path
  **/
  in_prox(relpath){ return path.join(this.prox_folder,relpath) }
  get fulltext_path(){return this._fulltext_path || (this._fulltext_path = this.in_prox('texte_entier.txt'))}
  get resultats_path(){return this._resultatspath || (this._resultatspath = this.in_prox('table_resultats.json'))}

  // Le path du dossier contenant tous les éléments
  get prox_folder(){return this._prox_folder || (this._prox_folder = path.join(this.text_folder,`${this.affixe}_prox`))}

  // Le path du dossier du fichier texte
  get text_folder(){return this._textfolder || (this._textfolder = path.dirname(this.path))}

  // L'affixe du fichier (pour le nom du dossier)
  get affixe(){return this._affixe || (this._affixe = path.basename(this.path,path.extname(this.path)))}

  get title(){return this._title || (this._title = this.affixe.replace(/_/g,' '))}

  get name(){return this._name||(this._name = path.basename(this.path))}
  // Le path du texte original
  get path(){return this._path}
}
