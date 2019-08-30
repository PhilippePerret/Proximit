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
        console.log("Retour de l'exécution de l'analyse : ", stdout)
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
    this._current.writeState()
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
    Méthode, utilisée normalement à l'ouverture du fichier, écrivant l'état
    de travail sur le texte, pour savoir jusqu'à quel point il a été analysée
    et corrigé.
  **/
  writeState(){
    if ( fs.existsSync(this.folder) ){
      console.log("Le texte a déjà été analysé")
    } else {
      console.log("Le texte n'a pas encore été analysé.")
    }
    let conteneur = Dom.createDiv({id:'cont-infos-texte', class:'container-data'})
    conteneur.innerHTML = ''
    UI.rightColumn.append(conteneur)
    // Le nom du texte (affixe)
    this.writeRowInfo(true, 'Nom du texte', this.affixe, conteneur)
    // Existence du dossier affixe_prox
    const folder_exists = fs.existsSync(this.folder) == true;
    this.writeRowInfo(folder_exists, `Dossier proximit`, this.folder, conteneur)
    if ( folder_exists ) {
      // Le dossier Proximit existe, on regarde ce qu'il contient pour
      // voir ce qu'on peut faire.

    } else {
      this.writeRowInfo(null, "Analyse et correction", "Il faut lancer l'analyse de ce texte.",conteneur)
    }
    // Si pas existence, on peut s'arrêter là
    // Si existence

  }

  writeRowInfo(coche, label, value, container){
    var div = Dom.createDiv({class:'row-data'})
    var lab = Dom.create('LABEL')
    lab.append(Dom.createSpan({class:'coche',text:coche === null?'':(coche?'✅':'❌')}))
    lab.append(Dom.createSpan({text: label, class:'label'}))
    div.append(lab)
    div.append(Dom.createSpan({text:value}))
    container.append(div)
  }

  // Le path du dossier contenant tous les éléments
  get folder(){return this._folder || (this._folder = path.join(this.text_folder,`${this.affixe}_prox`))}

  // Le path du dossier du fichier texte
  get text_folder(){return this._textfolder || (this._textfolder = path.dirname(this.path))}

  // L'affixe du fichier (pour le nom du dossier)
  get affixe(){return this._affixe || (this._affixe = path.basename(this.path,path.extname(this.path)))}

  // Le path du texte original
  get path(){return this._path}
}
