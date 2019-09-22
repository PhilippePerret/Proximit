'use strict';

/**
  |
  | Classe PTexte
  | ------------
  | Pour la gestion du texte complet en tant qu'entité Proximit
  |
**/
class PTexte {

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

    Méthode principale, appelée par le menu "Analyse > Analyser" qui
    lance la procédure d'analyse du texte courant.
    Pour le moment, elle demande à choisir le texte s'il n'y a pas de texte
    courant mais plus tard, le menu sera désactivé
  **/
  static async analyseCurrent(callback){
    const my = this
    if ( undefined === my.current ) my.chooseText()
    if ( undefined === my.current ) return ; // annulation
    my.current.analyzed = null
    // Si ce texte a déjà été enregistré, il faut confirmer deux fois
    // la destruction des corrections
    if ( Proximity.correctedCount > 0 ) {
      ask("Ce texte a déjà été corrigé à l'aide de Proximit.\nSi vous relancez son analyse, TOUTES LES MODIFICATIONS SERONT DÉFINITIVEMENT PERDUES.\n\nVoulez-vous vraiment perdre toutes les modifications ?",{
        buttons:[
            {text:'Renoncer',onclick:function(){UI.message('Analyse abandonnée.')}}
          , {text:'Détruire les modifications', onclick:this.proceedAnalyseCurrent.bind(this,callback)}
        ]
      })
    } else {
      this.proceedAnalyseCurrent(callback)
    }
  }
  static proceedAnalyseCurrent(callback){
    const my = this
    UI.clean()
    UI.waiter("Analyse du texte.\nMerci de patienter…", UI.texte.domObj)
    execFile(`./bin/analyse_texte.rb`, [PTexte.current.path], (err, stdout, stderr) => {
      UI.stopWaiter()
      if (err) {
        my.current.analyzed = false
        log.error(err)
        throw(err)
      } else {
        // Rappel : se trouve dans le stdout tout ce qui a été envoyé
        // par puts dans le script.
        // On réaffiche tout de suite les infos, pour savoir ce qu'a
        // pu faire l'analyse. On prépare aussi les boutons, etc.
        // Le mieux, c'est d'ouvrir le texte comme si c'était un nouveau
        // texte.
        my.open(my.current.path)
        if ('function' === typeof callback) callback.call()
      }
    })
  }

  /**
    Méthode appelée quand on joue le menu "Fichier > Choisir le texte…"
  **/
  static chooseText(){
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
    this.current.init()
    log.debug("<- PTexte::open(%s)",pth)
  }

  static reset(){
    log.debug("-> PTexte::reset")
    delete this._current
    this.current = undefined
    UI.clean() // on nettoie tout
    Proximity.reset()
    Canon.reset()
    Mot.reset()
    ProxModif.reset()
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
  static loadCurrent(){ this.current.load() }

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
  static get STATES(){return {
      complet:    {hname:'Non traité', description: "Le texte est dans son état original, avec ponctuations, etc."}
    , epured:     {hname:'Épuré', description:"Le texte a été épuré de ses ponctations et autres signes, ne reste que les mots et les nombre."}
    , splited:    {hname:'Splité', description:"Le texte a été découpé en mots, il existe sous forme de liste de mots bruts."}
    , lemmatised: {hname:'Lemmatisé', description:"Le texte existe sous forme de mots lemmatisés (ou chaque mot est une instance PMot)"}
    , analyzed:   {hname:'Analysé', description:"Le texte existe sous forme d'un document complètement analysés, avec statistique"}
    , formated:   {hname:'Formated', description:"Le texte existe sous forme de document formaté indiquant les proximités. Cette forme peut connaitre plusieurs format (cf. OUTPUT_FORMATS)"}
  }}

  static get OUTPUT_FORMATS(){return{
      fullColored:
      {
          hname:        'Full colorisé'
        , description:  "Texte intégral en RTF ou HTML avec indication des proximités par couleurs"
        , formats:      ['rtf', 'html']
      }
    , splited:
      {
          hname:        'Splité'
        , description:  "Texte découpé par section avec proximité, une section par proximité"
        , formats:      ['html','txt']
      }
  }}

  /** ---------------------------------------------------------------------
    | INSTANCE
  **/
  constructor(data){
    for(var k in data) this[`_${k}`] = data[k] // data.path => this._path
    delete this.firstMot
  }

  /**
    Initialisation du texte courant
    On charge ses résultats s'il est déjà analysé et on affiche ses informations
  **/
  async init(){
    this.loading = true
    delete this.firstMot
    UI.flash("Affichage du texte, merci de patienter…",{style:'neutre', keep:true, waiter:true})

    $('.texte_title').html(`${this.title} (<span class="texte-version">${this.version}</span>)`)
    this.setTexteHeight()
    if ( this.isAnalyzed ) {
      await this.initWhenAnalyzed()
    }
    // Écriture de l'état de l'analyse des proximités du texte
    this.writeState()

    this.inited = true
    if ( ! this.comparedValuesError ) {
      UI.flash("Texte prêt à être travaillé.", {style:'neutre',replace:true})
    }
    this.loading = false
  }

  /**
    Fixe la hauteur du texte pour qu'il prenne toute la hauteur de l'interface
  **/
  setTexteHeight(){
    let wHeight = window.innerHeight
      , hTexte  = wHeight - (80 /*header et info prox*/ + 25 /* footer */ + 88 /* padding */ + 5 )
    $(UI.texte.domObj).css('height',`${hTexte}px`)
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

  /**
    | Initialisation à faire lorsque le texte a été analysé
    |
    | On doit :
    |   - afficher l'état des proximités
    |   - proposer les boutons pour voir les proximités
  **/
  async initWhenAnalyzed(){
    await UI.waiter("Affichage du texte. Merci de patienter…", UI.rightColumn.domObj)

    // Pour chaque objet Mot, Canon et Proximity, on charge les données soit
    // de la table des résultats produite par ruby, soit des fichiers propres
    // enregistrés après les premières modifications.

    console.time('Fin du chargement')

    try {
      // Les mots
      await Mot.loadData()

      // On peuple les canons
      // + peuplement des mots s'ils ne sont pas définis dans un fichier
      await Canon.loadData()

      // On peuple les proximités (soit de la table des résultats)
      await Proximity.loadData()

      // Les mots et les proximités sont enregistrés seulement par leur
      // identifiant. Il faut les transformer en instance
      Canon.dispatchMotsEtProximites.call(Canon)

      // Pour afficher les informations concernant les proximités et régler
      // les boutons qui permettent de les afficher.
      Proximity.init(this)
      Proximity.correctedCount  = this.datas.nombre_corrections || 0
      Proximity.addedCount      = this.datas.nombre_added || 0
      Proximity.ignoredCount    = this.datas.nombre_ignored || 0

      // On écrit le texte dans la page
      this.writeTexte()

      // On vérifie la conformité des élément
      this.checkData()

      // On regarde s'il ne faudrait pas faire une nouvelle version
      this.checkLastVersionDate()
      console.timeEnd('Fin du chargement')

    } catch (e) {
        console.error(e)
        UI.error("Une erreur est malheureusement survenue.")
    } finally {
      // Dans tous les cas, on stoppe le waiter
      UI.stopWaiter()
    }


  }

  /**
    Retourne les données du fichier data.json (qui permet notamment de
    vérifier que le chargement s'est bien passé en controlant le nombre
    d'instances de chaque type et quelques autres valeurs — cf. ci-dessous la
    méthode `checkData`)
  **/
  getDatas(){
    // note : ne pas utiliser 'require', pour les tests
    var d = JSON.parse(fs.readFileSync(this.dataPath,'utf-8'))
    if ( undefined !== d.datas ) d = d.datas
    return d
  }
  /**
    Enregistre les données courantes pour vérifier le bon chargement des
    données plus tard.
  **/
  saveData(){
    const my = this
    let datas = this.getDatas()
    Object.assign(datas,{
        nombre_proximites:  Object.keys(Proximity.items).length
      , nombre_corrections: Proximity.correctedCount // pas pour vérification, mais vraiment pour le compte
      , nombre_ignored:     Proximity.ignoredCount
      , nombre_added:       Proximity.addedCount
      , nombre_canons:      Object.keys(Canon.items).length
      , nombre_mots:        Object.keys(Mot.items).length
      , firstMot_id:        my.firstMot.id
      , lastId_mot:         Mot.lastId
      , lastId_proximity:   Proximity.lastId
      , updated_at:         String(new Date())
      , version:            this.version
      , dateVersion:        String(new Date())
    })
    // console.log("datas:", datas)
    fs.writeFileSync(this.dataPath, JSON.stringify(datas))
    return true
  }

  // Retourne true si ce texte a déjà été enregistré depuis Proximit
  get hasBeenModified() {
    return fs.existsSync(this.in_prox('mots.json'))
  }
  /**
    Vérifie la conformité des données chargées
  **/
  checkData(){
    let datas = this.getDatas()

    // On doit vérifier que les nombres enregistrés dedans (if any) correspondent aux
    // nombre chargés
    if ( !this.hasBeenModified ) return;

    this.comparedValuesError = false

    this.checkValue('nombre mots')
    this.checkValue('nombre canons')
    this.checkValue('nombre proximités')
    this.checkValue('nombre ignorées')
    this.checkValue('id first mot')
    this.checkValue('last id mot')
    this.checkValue('last id proximity')

    if ( this.comparedValuesError ) {
      return UI.error("Des erreurs ont été trouvées au niveau des nombres d'éléments.\nConsultez la console pour de plus amples détails.",{replace:true})
    } else {
      return true
    }
  }

  get datas() { return this._datas || (this._datas = this.getDatas() )}

  checkValue(value_id) {
    const my = this
    var [msg, expected, actual ] = (function(vid){
      switch (vid) {
        case 'nombre mots':
          return ['nombre de mots', my.datas.nombre_mots, Object.keys(Mot.items).length]
        case 'nombre canons':
          return ['nombre de canons', my.datas.nombre_canons, Object.keys(Canon.items).length]
        case 'nombre proximités':
          return ['nombre de proximités', my.datas.nombre_proximites, Object.keys(Proximity.items).length]
        case 'nombre ignorées':
          return ['nombre de proximités ignorées', my.datas.nombre_ignored, Proximity.ignoredCount]
        case 'id first mot':
          return ['ID du premier mot', my.datas.firstMot_id, my.firstMot.id]
        case 'last id mot':
          return ['dernier ID pour un mot', my.datas.lastId_mot, Mot.lastId]
        case 'last id proximity':
          return ['dernier ID pour une proximité', my.datas.lastId_proximity, Proximity.lastId]

        default:
          return ['rien', 0, 0]
      }
    })(value_id)
    if ( expected != actual ) {
      this.comparedValuesError = true
      log.warn("Problème avec le %s ! Nombre attendu : %d, nombre réel : %d", msg, expected, actual)
    } else {
      log.debug("Après chargement, le %s est conforme (%d)", msg, expected)
    }
  }

  get dataPath(){ return this.in_prox('data.json') }

  /**
    Écrit tout le texte à l'écran
  **/
  writeTexte(){
    const my = this
    var curmot = this.firstMot
    while ( curmot ) {
      curmot.asDom.forEach(span => UI.texte.append(span))
      curmot = curmot.motN
    }
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
