# encoding: UTF-8
=begin

  Classe pour la gestion du texte dans son ensemble, une fois que tous les
  textes d'une analyse ont été rassemblés.

=end
class TextAnalyzer
class Analyse
class WholeText

  # Pour la gestion des données enregistrées et loadées
  include ModuleForFromYaml

  # Pour l'enregistrement YAML
  def yaml_properties
    {
      datas: {
        path:             {type: YIVAR},
        lemma_file_path:  {type: YIVAR},
        length:           {type: YIVAR},
        pages_count:      {type: YIVAR},
        mots:             {type: YFDATA}
      }
      # Other properties
    }
  end

  # Chemin d'accès au fichier contenant tout le texte
  def path
    @path ||= File.join(analyse.prox_folder,'texte_entier.txt')
  end

  # Chemin d'accès au fichier produit par tree-tagger
  def lemma_file_path
    @lemma_file_path ||= File.join(analyse.prox_folder,'texte_entier_lemmatized.txt')
  end

  # Longueur du texte
  def length
    @length ||= File.stat(path).size
  end

end #/WholeText
end #/Analyse
end #/TextAnalyzer
