# encoding: UTF-8
class TextAnalyzer
class Analyse
class TableResultats
  class Proximite

    attr_accessor :id
    attr_accessor :analyse

    # Instanciation d'une nouvelle proximité
    def initialize ianalyse, id = nil, motA = nil, motB = nil
      self.analyse    = ianalyse
      self.id         = id
      @motA = motA
      @motB = motB
    end

  end #/Proximite
end #/TableResultats
end #/Analyse
end #/TextAnalyzer
