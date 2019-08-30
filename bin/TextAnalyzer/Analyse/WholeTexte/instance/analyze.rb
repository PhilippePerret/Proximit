# encoding: UTF-8
class TextAnalyzer
class Analyse
class WholeText

  # Note : attention, la propriété `analyse` existe, c'est l'instance
  # de l'analyse contenant le fichier.
  def proceed_analyse
    # = Lemmatisation du texte =
    lemmatize
    # Relève des mots dans le fichier unique contenant tout le texte
    # cf. fichier 'releve_mots.rb'
    releve_mots
  end

end #/WholeText
end #/Analyse
end #/TextAnalyzer
