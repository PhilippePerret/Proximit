# encoding: UTF-8
=begin

=end
class TextAnalyzer
class Analyse
class WholeText
class Mots

  # Pour créer un nouveau mot
  #
  # RETURN L'instance Mot, pour ajout aux résultats
  def create data_mot
    imot = TextAnalyzer::Analyse::WholeText::Mot.new(data_mot)
    self.items ||= Hash.new
    self.items.merge!(imot.id => imot)
    return imot
  end

end #/Mots
end #/WholeText
end #/Analyse
end #/TextAnalyzer
