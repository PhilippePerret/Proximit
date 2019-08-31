# encoding: UTF-8
=begin

=end
class TextAnalyzer
class Analyse
class WholeText
class Mots

  # Pour récupérer un mot
  def get_by_index mot_id
    self.items[mot_id]
  end
  alias :[] :get_by_index

end #/Mots
end #/WholeText
end #/Analyse
end #/TextAnalyzer
