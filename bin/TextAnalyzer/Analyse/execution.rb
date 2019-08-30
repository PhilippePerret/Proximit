# encoding: UTF-8
class TextAnalyzer
class Analyse

  # = main =
  #
  # Procède à l'analyse.
  #
  # La méthode rassemble tous les textes en un seul texte puis l'analyse.
  # Puis elle enregistre les résultats dans un fichier caché.
  #
  def exec

    # Initialisation de l'analyse
    init_analyse

    # On prend les fichiers donnés en argument et on en fabrique un seul
    assemble_texts_of_paths

    # On procède à l'analyse
    texte_entier.proceed_analyse

    # Calcul des proximités
    table_resultats.calcule_proximites

    # On sauve le tout
    save_all

  end


end #/Analyse
end #/TextAnalyzer
