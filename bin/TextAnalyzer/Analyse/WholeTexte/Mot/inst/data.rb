class TextAnalyzer
class Analyse
class WholeText
class Mot

  # Pour la gestion des données YAML
  include ModuleForFromYaml

  attr_accessor :analyse

  # {String} Le mot fourni à l'instanciation et le mot initial gardé,
  # même si :real_mot est transformé.
  attr_accessor :real, :real_init

  # {Integer} ObjectID du fichier (TextAnalyzer::File) auquel appartient
  # le mot
  attr_accessor :file_id

  # {Integer} Identifiant du mot, qui correspond, si aucun mot n'est ajouté
  # ou supprimé, à son index dans le texte complet.
  attr_accessor :id

  # {Integer} Identifiant du mot précédent et du mot suivant
  # (s'ils existent)
  attr_accessor :idP, :idN

  # {String} Portion de texte entre le mot et son suivant, qui est constitué
  # de ponctuation, de parenthèse, etc. selon les cas. Cette donnée permet de
  # reconstituer le texte à partir des identifiants des mots, sans passer par
  # le texte complet.
  # Signifie "Text Between Words" (donc le texte entre les mots, donc le texte
  # entre ce mot et le mot suivant)
  attr_accessor :tbw

  # {Integer} Décalage du mot dans le texte (attention : le texte complet,
  # pas le texte du fichier :file).
  attr_accessor :offset

  # {Integer} Décalage du mot dans le texte de son fichier
  attr_accessor :rel_offset

  attr_accessor :px_idP, :px_idN

  # Pour composer la donnée qui sera enregistrée
  def yaml_properties
    {
      no_date: true,
      datas: {
        id:           {type: YAPROP},
        idP:          {type: YAPROP}, # signifie "id previous word"
        idN:          {type: YAPROP}, # signifie "id next word"
        tbw:          {type: YAPROP}, # signifie "text between word" (cf. ci-dessus)
        real:         {type: YAPROP},
        offset:       {type: YAPROP},
        rel_offset:   {type: YAPROP}, # signifie "relative offset"
        real_init:    {type: YAPROP},
        file_id:      {type: YAPROP},
        px_idP:       {type: YAPROP}, # signifie "proximité identifiant previous"
        px_idN:       {type: YAPROP}, # signifie "proximité identifiant next"
        downcase:     {type: YIVAR},
        lemma:        {type: YIVAR},
        canon:        {type: YIVAR},
        length:       {type: YIVAR},
        sortish:      {type: YIVAR}
      }
    }
  end
  def file
    @file ||= TextAnalyzer::AnalyzedFile.get(file_id)
  end

  def downcase
    @downcase ||= real.downcase
  end

  # Forme "lémmatisée" du mot, c'est-à-dire :
  #   - singulier
  #   - masculin (si féminine)
  #   - les verbes gardent leur forme (c'est la différence avec les canons)
  #
  def lemma
    @lemma ||= begin
      data_lemma && !verbe? ? data_lemma[:canon] : downcase
    end
  end

  # Forme canonique du mot (lemmatisé). Par exemple, "marcherions" aura
  # comme forme canonique "marcher"
  def canon
    @canon ||= (data_lemma ? data_lemma[:canon] : downcase)
  end
  alias :canonique :canon

  # Les données de lemmatisation du mot, si elles existent.
  # Ces données contient {:canon, :nature, :detail}
  # Elles servent notamment à calculer la propriété lemma
  def data_lemma
    @data_lemma ||= TABLE_LEMMATISATION[downcase]
  end

  def length
    @length ||= real.length
  end

  # La version du mot qui permet de faire les classements
  def sortish
    @sortish ||= real.downcase.normalize
  end

  # RETURN true si le mot est en proximité avec un autre mot
  def en_proximite?
    px_idP || px_idN
  end

  def prox_avant
    @prox_avant ||= begin
      analyse.table_resultats.proximites[px_idP]
    end
  end
  def prox_avant= iprox
    self.px_idP = iprox.nil? ? nil : iprox.id
  end
  def prox_apres
    @prox_apres ||= begin
      analyse.table_resultats.proximites[px_idN]
    end
  end
  def prox_apres= iprox
    self.px_idN = iprox.nil? ? nil : iprox.id
  end

  def distance_minimale
    @distance_minimale ||= self.class.distance_minimale(canon)
  end

  def pourcentage_utilisation
    @pourcentage_utilisation ||= nombre_occurences.pct(analyse.texte_entier.mots.count)
  end

  def nombre_occurences
    @nombre_occurences ||= data_in_table_resultats.count
  end

  # Méthode qui retourne le nombre de proximités du canon de ce mot
  # Noter que la valeur sera la même pour tous les mots qui partagent
  # ce canon. Elle est utile pour les listings et notamment le classement
  # par nombre de proximités, justement.
  def nombre_proximites
    @nombre_proximites ||= begin
      analyse.canons[self.canon] || (return '-')
      analyse.canons[self.canon].proximites.count
    end
  end

  def data_in_table_resultats
    @in_table_resultats ||= self.analyse.table_resultats.mots[self.lemma]
  end

end #/Mot
end #/WholeText
end #/Analyse
end #/TextAnalyzer
