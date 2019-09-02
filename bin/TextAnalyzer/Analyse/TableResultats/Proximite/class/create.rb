class TextAnalyzer
class Analyse
class TableResultats
class Proximite
  class << self

    # Création d'une proximité nouvelle entre le mot +motA+ et
    # le mot +motB+ dans le tableau de proximités +tableau+
    def create table, motA, motB
      table.last_id_proximite += 1
      new_prox_id = table.last_id_proximite.to_i

      new_prox = new(table.analyse, new_prox_id, motA, motB)
      table.proximites << new_prox
      table.canons.add_proximite(motA, new_prox)

      # On associe les mots à leur proximité
      motA.prox_apres= new_prox
      motB.prox_avant= new_prox

      # On retourne la nouvelle proximité créée
      return new_prox
    end
    # /create
  end #/ << self
end #/Proximite
end #/TableResultats
end #/Analyse
end #/TextAnalyzer
