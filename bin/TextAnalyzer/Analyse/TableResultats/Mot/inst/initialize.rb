# encoding: UTF-8
=begin
  Classe TextAnalyzer::Analyse::TableResultats::Mot
  ---------------------------------------------------
  Instance pour les mots (pour UN mot de résultat)
  )
=end
class TextAnalyzer
class Analyse
class TableResultats
class Mot

  def initialize imot = nil, data = nil
    unless imot.nil? # rechargement
      self.real     = imot.real
      self.downcase = imot.downcase
      self.sortish  = imot.downcase.normalize
      self.data     = data
      # self.indexes  = [] # DEPRECATED
      self.ids      = []
    end
  end

  # Ajout d'un mot (on ajoute son ID. On pourra retrouver le mot avec
  # <analyse>.mots[<ID>])
  # Noter qu'avant on parlait d'index, mais comme des mots peuvent être
  # ajoutés et retirés, il vaut mieux parler d'identifiant maintenant.
  def << imot
    # self.indexes << imot.index
    self.ids << imot.id
  end

end #/Mot
end #/TableResultats
end #/Analyse
end #/TextAnalyzer
