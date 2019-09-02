# encoding: UTF-8
=begin
  Module contenant les méthodes de propriétés
=end
class TextAnalyzer
class Analyse
class TableResultats
class Proximite

  # Pour la gestion des données enregistrées et loadées
  include ModuleForFromYaml

  # Pour indiquer que cette proximité a été corrigée, supprimée ou ignorée
  attr_accessor :fixed, :erased, :ignored

  # Pour le module YAML
  def yaml_properties
    {
      datas: {
        fixed:              {type: YAPROP},
        erased:             {type: YAPROP},
        ignored:            {type: YAPROP},
        motA_id:    {type: YIVAR},
        motB_id:    {type: YIVAR},
        distance:           {type: YIVAR},
        distance_minimale:  {type: YIVAR}
      }
    }
  end

  def motA
    @motA ||= motA_id ? analyse.get_mot_by_index(motA_id) : nil
  end
  def motB
    @motB ||= motB_id ? analyse.get_mot_by_index(motB_id) : nil
  end

  def motA_id
    @motA_id ||= motA ? motA.id : nil
  end
  def motB_id
    @motB_id ||= motB ? motB.id : nil
  end

  # retourne la distance, en caractères, entre les deux mots (de la fin
  # du premier au début du deuxième)
  def distance
    @distance ||= begin
      motB.offset > motA.offset || begin
        @distance = 'UNAVAILABLE' # sinon, stack level overflow avec le inspect
        rt('commands.proximity.errors.distance_null', {iprox: self.inspect})
      end
      motB.offset - (motA.offset + motA.length)
    end
  end

  # La distance minimale pour cette proximité
  def distance_minimale
    @distance_minimale ||= begin
      TextAnalyzer::Analyse::WholeText::Mot.distance_minimale(motA.canon)
    end
  end

  # Transforme l'instance en hash, pour l'utilisation par exemple dans les
  # string-interpolation
  # Note : puisque ces valeurs sont destinées à servir pour les interpolations,
  # on cherche la valeur string qui peut être affichée (cf. les motA et
  # motB par exemple)
  def to_h
    {
      motA: "#{motA.real} [#{motA.index}]",
      motB: "#{motB.real} [#{motB.index}]",
      distance: distance, distance_minimale: distance_minimale,
      id: id
    }
  end
  alias :to_hash :to_h
end #/Proximite
end #/TableResultats
end #/Analyse
end #/TextAnalyzer
