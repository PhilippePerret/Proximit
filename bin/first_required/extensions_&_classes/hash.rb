# encoding: UTF-8
# Extension de la class Hash

=begin

  Extension Hash
  Version 2.0.0

=end

class Hash

  # Merge profond simple
  def deep_merge hash
    merged = self
    hash.each do |k, v|
      if v.class == Hash
        merged = merged.merge( k => merged[k].deep_merge(v) )
      else
        merged = merged.merge k => v
      end
    end
    merged
  end

  # Pour un affichage plain (pas HTML), affiche le hash de façon lisible, chaque
  # clé passant à la ligne + des retraits.
  # @usage : puts <hash>.pretty_inspect
  # @param  retrait {Fixnum|String}
  #         Le retrait à appliquer à chaque donnée
  def pretty_inspect retrait = nil
    retrait = case retrait
    when Fixnum   then "  " * retrait
    when String   then retrait
    else ""
    end
    str = "{\n"
    next_retrait = retrait + "  "
    self.each do |k, v|
      str += retrait + "#{k.inspect} => " +
      case v
      when Hash, Array   then v.pretty_inspect(next_retrait)
      else v.inspect
      end + "\n"
    end
    str + retrait + "}"
  end

  # Plutôt une méthode de débuggage : pour faire un affichage
  # plus lisible d'un Hash.
  def pretty_puts deep = 1
    self.collect do |key, value|
      '<div>' + ("&nbsp;&nbsp;"*deep) + "#{key.inspect} => " +
      case value.class.to_s
      when "Hash" then value.pretty_puts(deep + 1)
      else
        value.inspect
      end +
      '</div>'
    end.join("")
  end

  # Remplace les "true", "false", "null" par true, false, nil
  def values_str_to_real
    self.each do |k,v|
      v = case v.class.to_s
      when 'Hash', 'Array' then v.values_str_to_real
      when 'String' then
        case v
        when "true" then true
        when "false" then false
        when "nil", "null" then nil
        else v
        end
      else v
      end
      self[k] = v
    end
  end

  # Permet de remplacer les clés 'string' par :string
  # Utile par exemple pour des données JSON récupérées
  def to_sym
    hash_ruby = {}
    self.each do |k, v|
      v_ruby =
      case v
      when Hash, Array then v.to_sym
      else v
      end
      hash_ruby.merge!( k.to_sym => v_ruby )
    end
    hash_ruby
  end
  alias :symbolize_keys :to_sym



  # Retourne le hash où les clés symboliques ont été remplacées par des
  # clés Camélisée : :title_prov => TitleProv
  def symbol_to_camel
    h = {}
    self.each do |k, v|
      if k.is_a?(String)
        h.merge!(k => v)
      else
        h.merge!(k.camelize => v)
      end
    end
    return h
  end

end
