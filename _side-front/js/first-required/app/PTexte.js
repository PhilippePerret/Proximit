'use strict'
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

  /**

    Méthode principale, appelée par le menu "Analyse > Analyser le texte" qui
    lance la procédure d'analyse du texte courant.
    Pour le moment, elle demande à choisir le texte s'il n'y a pas de texte
    courant mais plus tard, le menu sera désactivé
  **/
  static analyseCurrent(){
    if ( undefined === this.current ) this.chooseText()
    if ( undefined === this.current ) return ; // annulation
    execFile(`./bin/analyse_texte.rb`, [PTexte.current.path], (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        throw(err)
      } else {
        // Rappel : se trouve dans le stdout tout ce qui a été envoyé
        // par puts dans le script.
        // console.log("Retour de l'exécution de l'analyse : ", stdout)
        // On réaffiche tout de suite les infos, pour savoir ce qu'a
        // pu faire l'analyse
        PTexte.current.writeState()
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
    état d'analyse et de correction (en tout cas pour le moment)
  **/
  static open(pth){
    this._current = new PTexte({path: pth})
    this._current.init()
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
  }

  /**
    Initialisation du texte courant
    On charge ses résultats s'il est déjà analysé et on affiche ses informations
  **/
  init(){
    // Chargement du fichier résultats
    this.resultats = require(this.resultats_path)
    // Écriture de l'état du texte
    this.writeState()
    if (this.isAnalyzed) this.initWhenAnalyzed()
  }

  /**
    | Initialisation à faire lorsque le texte a été analysé
    |
    | On doit :
    |   - afficher l'état des proximités
    |   - proposer les boutons pour voir les proximités
  **/
  initWhenAnalyzed(){
    Mot.init()
    // On peuple les canons
    // + peuplement des mots
    Canon.set(this.resultats.datas.canons.datas)
    // On peuple les proximités
    Proximity.set(this.resultats.datas.proximites.datas)
    Proximity.init(this)
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
    | Retourne la portion de texte depuis le caractère d'offset +fromOffset+
    | au caractère d'offset +toOffset+ en affichant un minimum de +min+
    | caractères si ce nombre est précisé.
    |
  **/
  getTextFromTo(fromOffset, toOffset){
    const len = toOffset - fromOffset
    const fd  = fs.openSync(this.fulltext_path, 'r');
    const buf = new Buffer(len)
    // buf.fill('')
    const str = fs.readSync(fd, buf, 0, len, fromOffset)
    // console.log("Texte ramené (de %d à %d) : '%s'", fromOffset, toOffset, buf.toString())
    return buf.toString()
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

  }

  writeRowInfo(coche, label, value){
    UI.infos_texte.append(rowData(coche,label,value))
  }


  /**
    | ---------------------------------------------------------------------
    | Propriétés volatiles
  **/

  // Retourne la date de la dernière analyse, si le texte a été analysé
  get analyse_date(){
    if ( ! this.isAnalyzed ) return
    return new Date(this.resultats.datas.created_at)
  }

  // Retourne true si le texte a été analysé
  get isAnalyzed(){return fs.existsSync(this.prox_folder)}

  /**
    Propriétés de path
  **/
  in_prox(relpath){
    return path.join(this.prox_folder,relpath)
  }
  get fulltext_path(){return this._fulltext_path || (this._fulltext_path = this.in_prox('texte_entier.txt'))}
  get resultats_path(){return this._resultatspath || (this._resultatspath = this.in_prox('table_resultats.json'))}

  // Le path du dossier contenant tous les éléments
  get prox_folder(){return this._prox_folder || (this._prox_folder = path.join(this.text_folder,`${this.affixe}_prox`))}

  // Le path du dossier du fichier texte
  get text_folder(){return this._textfolder || (this._textfolder = path.dirname(this.path))}

  // L'affixe du fichier (pour le nom du dossier)
  get affixe(){return this._affixe || (this._affixe = path.basename(this.path,path.extname(this.path)))}

  // Le path du texte original
  get path(){return this._path}
}
