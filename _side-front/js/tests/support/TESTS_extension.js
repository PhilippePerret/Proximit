'use strict'

const rmrf = require('rimraf')

Object.assign(TESTS,{
  name: 'extension TESTS'

  /**
    Pour faire des vérifications très simplement

    @param {Boolean} silencieux   Si true, ce sont des vérifications qui ne
                                  produisent qu'une sortie en cas d'échec.
    @param {Hash}     args        Les vérifications à produire. Cf. ci-dessous

      :proximites_existantes {Array de Number} Liste d'identifiants de proximités qui doivent exister
      :proximites_inexistantes {Array de Number} Liste d'identifiants de proximités qui ne doivent pas exister
      :proximites_count     {Number}  Le nombre total de proximités
                                      + Le nombre affiché
      :corrected_proximites {Number}  Le nombre de proximités corrigés
                                      + Le nombre affiché
      :ignored_proximites   {Number}  Le nombre de proximités ignorées
                                      + Le nombre affiché
      :added_proximites     {Number}  Le nombre de proximités ajoutées
                                      + son nombre affiché
      :mots_count           {Number}  Le nombre total de mots
                                      + Le nombre affiché de mots dans les infos.
      :motB_px_idP          {Number}  Identifiant de la proximité previous du
                                      motB. Note :motB doit être transmis
      :motB_px_idN          {Number}  Identifiant de la proximité next du
                                      motB. Note :motB doit être transmis
      :motB                 {Mot}     Le mot qui sert pour les tests ci-dessus
      :motA_px_idP          {Number}  Identifiant de la proximité previous du
                                      motA
      :motA_px_idN          {Number}  Identifiant de la proximité next du
                                      motA. MotA doit être transmis
      :motA                 {Mot}     Le mot qui sert pour les tests ci-dessus
      :nombre_occurences_canon  {Number}  Nombre d'occurences de mots du canon
                                          :canon qui doit être transmis
      :nombre_proximites_canon  {Number}  Nombre de proximités du canon :canon
                                          qui doit être transmis.
      :canon                    {Canon}   Le canon transmis pour les tests ci-
                                          dessus.
      :mots_existants   {Array de Number} Liste d'identifiants de mots qui doivent exister.
                                          + Existance du mot dans le texte
                                          Note : on peut envoyer aussi des instances de Mot.
      :mots_inexistants {Array de Number} Liste d'identifiants de mots qu'on ne
                                          doit plus trouver.
                                          + Existence du mot dans le texte
  **/
, assert(args, silencieux){
    silencieux = silencieux || false
    let dg = silencieux ? 6/* => simple vérification*/ : 0/*=> toujours affiché*/

    if ( undefined !== args.proximites_existantes ) {
      args.proximites_existantes.forEach(proxId => assert(dg, Proximity.get(proxId) instanceof(Proximity), `La proximité #${proxId} existe bien.`))
    }
    if ( undefined !== args.proximites_inexistantes ) {
      args.proximites_inexistantes.forEach(proxId => assert(dg, isNullish(Proximity.get(proxId)), `Comme voulu, la proximité #${proxId} n'existe pas ou plus.`))
    }
    if ( undefined !== args.proximites_count ) {
      let nombreProx = Object.keys(Proximity.items).length
      assert(dg, nombreProx == args.proximites_count, `Il y a bien ${args.proximites_count} proximités au départ (nombre d'items dans Proximity.items : ${nombreProx}).`)
      assert(dg,Page.getInner('#nombre_proximites')==String(args.proximites_count), `Le nombre affiché de proximités est ${args.proximites_count} (${Page.getInner('#nombre_proximites')})`)
    }
    if ( undefined !== args.corrected_proximites) {
      assert(dg,Proximity.correctedCount == args.corrected_proximites, `Le nombre de proximités corrigées est ${args.corrected_proximites} (Proximity.correctedCount = ${Proximity.correctedCount})`)
      assert(dg,Page.getInner('#corrected_proximites') == String(args.corrected_proximites), `Le nombre affiché de proximités corrigées est ${args.corrected_proximites} (${Page.getInner('#corrected_proximites')})`)
    }
    if ( undefined !== args.ignored_proximites) {
      assert(dg,Proximity.ignoredCount == args.ignored_proximites, `Le nombre de proximités corrigées est ${args.ignored_proximites} (Proximity.ignoredCount = ${Proximity.ignoredCount})`)
      assert(dg,Page.getInner('#ignored_proximites') == String(args.ignored_proximites), `Le nombre affiché de proximités corrigées est ${args.ignored_proximites} (${Page.getInner('#ignored_proximites')})`)
    }
    if ( undefined !== args.added_proximites) {
      assert(dg,Proximity.addedCount == args.added_proximites, `Le nombre de proximités ajoutées est ${args.added_proximites} (Proximity.addedCount = ${Proximity.addedCount})`)
      assert(dg,Page.getInner('#added_proximites') == String(args.added_proximites), `Le nombre affiché de proximités ajoutées est ${args.added_proximites} (${Page.getInner('#added_proximites')})`)
    }
    if ( undefined !== args.mots_count) {
      var nbmots = Object.keys(Mot.items).length
      assert(dg,nbmots == args.mots_count, `Le nombre de mots est bien ${args.mots_count} (nombre Mot.items = ${Object.keys(Mot.items).length})`)
      assert(dg,Page.getInner('#nombre_mots') == String(args.mots_count), `Le nombre de mots affiché est ${args.mots_count} (${Page.getInner('#nombre_mots')})`)
    }
    if ( undefined !== args.motA_px_idP) {
      assert(dg, args.motA.px_idP == args.motA_px_idP, `Le motA a la bonne valeur px_idP qui vaut ${args.motA_px_idP} (#${args.motA.px_idP})`)
    }
    if ( undefined !== args.motA_px_idN) {
      assert(dg, args.motA.px_idN == args.motA_px_idN, `Le motA a la bonne valeur px_idN qui vaut ${args.motA_px_idN} (#${args.motA.px_idN})`)
    }
    if ( undefined !== args.motB_px_idP) {
      assert(dg, args.motB.px_idP == args.motB_px_idP, `Le motB a la bonne valeur px_idP qui vaut ${args.motB_px_idP} (#${args.motB.px_idP})`)
    }
    if ( undefined !== args.motB_px_idN) {
      assert(dg, args.motB.px_idN == args.motB_px_idN, `Le motB a la bonne valeur px_idN qui vaut ${args.motB_px_idN} (#${args.motB.px_idN})`)
    }
    if ( undefined !== args.nombre_occurences_canon) {
      assert(dg, args.canon.nombre_occurences == args.nombre_occurences_canon, `Le canon "${args.canon.id}" a bien ${args.nombre_occurences_canon} occurences (canon.nombre_occurences = ${args.canon.nombre_occurences})`)
    }
    if ( undefined !== args.nombre_proximites_canon) {
      assert(dg, args.canon.nombre_proximites == args.nombre_proximites_canon, `Le canon "${args.canon.id}" a bien ${args.nombre_proximites_canon} proximités (canon.nombre_proximites = ${args.canon.nombre_proximites})`)
    }
    if ( undefined !== args.mots_existants ) {
      args.mots_existants.forEach( motId => {
        if ( motId instanceof Mot ) motId = motId.id
        assert(dg,Mot.get(motId) instanceof(Mot), `Le mot #${motId} existe.`)
        assert(dg, !isNullish(Page.get(`.mot[data-id="${motId}"]`,'strict')), `Le mot #${motId} se trouve dans le texte affiché.`)
      })
    }
    if ( undefined !== args.mots_inexistants ) {
      args.mots_inexistants.forEach( motId => {
        if ( motId instanceof Mot ) motId = motId.id
        assert(dg,isNullish(Mot.get(motId)), `Comme voulu, le mot #${motId} n'existe pas ou plus.`)
        assert(dg, isNullish(Page.get(`.mot[data-id="${motId}"]`,'strict')), `Comme voulu, le mot #${motId} ne se trouve pas dans le texte affiché.`)
      })
    }
  }

  /**
    Ouvre un texte (et vérifie qu'il a bien été chargé)
    Le texte doit se trouver dans './spec/support/assets/textes/'
    @async => utiliser "await TESTS.openTexte("...")"

    @param {String} text_name Le nom du fichier dans le dossier
                              ./spec/support/assets/textes/
    @param {Hash} options
                  :reset    Si true, on doit détruire le dossier _prox
                  :analyze  Si true, on doit procéder à l'analyse du texte après
                            son ouverture.
  **/
, async openTexte(text_name, options){
    options = options || {}
    let path_texte = TESTS.pathOfTexte(text_name)
    if ( options.reset ) {
      // S'il faut tout réinitialiser, on détruit le dossier _prox du texte
      let proxfolder = this.pathFolderTexte(path_texte)
      if ( fs.existsSync(proxfolder) ) await this.eraseProxFolder(proxfolder)
    }
    // On attend que le chargement soit terminé (par exemple pour une ouverture
    // demandée dès le lancement)
    await TESTS.waitFor(() => App.loading === false)
    await PTexte.open(path_texte)
    if ( options.analyze ) {
      await this.analyzeTexte()
    }
    await TESTS.waitFor( () => PTexte.current.loading === false )
    assert(PTexte.current.name == text_name, `Le nom du texte courant est bien "${text_name}".`, `Le nom du texte courant devrait être "${text_name}", or, c'est "${PTexte.current.name}".`)
  }

, eraseProxFolder(proxfolder){
    return new Promise((ok,ko)=>{
      rmrf(proxfolder, [], ok)
    })
  }
, analyzeTexte(){
    return new Promise((ok,ko)=>{
      PTexte.analyseCurrent(ok)
    })
  }
, pathFolderTexte(textpath){
    const dir = path.dirname(textpath)
    const aff = path.basename(textpath,path.extname(textpath))
    return path.join(dir,`${aff}_prox`)
  }
})
