# encoding: UTF-8
#
# version 1.4.7
#
# Note version 1.4.7
#   Ajout des constantes INDENT, DBLINDENT, INDENT_TIRET
# Note version 1.4.6
#   Ajout de la méthode `affixe`.
# Note version 1.4.5
#   Simplifications.
# Note version 1.4.4
#   Ajout de la méthode `or_nil`
# Note version 1.4.3
#   La méthode relative_path peut prendre un argument pour définir
#   le dossier de départ.
# Note version 1.4.2
#   Ajout de la méthode `titleize` (qui va mettre des capitales à
#   tous les mots du titre)
# Note version 1.4.1
#   Ajout de la méthode de classe String.french_titleize(<string>) pour
#   transformer une chaine de caractères en titre français.
# Note version 1.4.0
#   Ajout des méthodes d'autres fichiers, comme my_downcase, camelize
#   etc.
# Note version 1.3.2
#   Ajout méthode `relative_path`
# Note version 1.3.1
#   Ajout de la couleur noir sur blanc (noirsurblanc)
# Note version 1.3.0
#   Méthode String.rgb pour mettre n'importe quelle couleur en console.
#

INDENT        = '  '
DBLINDENT     = INDENT * 2
INDENT_TIRET  = INDENT + '– '

class String

  PAGE_WIDTH        = 1500.0
  NOMBRE_MOTS_PAGE  = 250

  RC = <<-EOT

  EOT

  CHIFFRE_HAUT = {
    0 => '⁰',
    1 => '¹',
    2 => '²',
    3 => '³',
    4 => '⁴',
    5 => '⁵',
    6 => '⁶',
    7 => '⁷',
    8 => '⁸',
    9 => '⁹'
  }

  CHIFFRE_BAS = {
    0 => '₀',
    1 => '₁',
    2 => '₂',
    3 => '₃',
    4 => '₄',
    5 => '₅',
    6 => '₆',
    7 => '₇',
    8 => '₈',
    9 => '₉'
  }

  class << self
    def french_titleize titre
      titre = titre.downcase.split
      if ['le','la','les', 'l\'', 'l’'].include?(titre[0]) && titre[1]
        titre[1] = titre[1].capitalize
      end
      titre[0] = titre[0].capitalize
      titre.join(' ')
    end
  end #/<< self

  # ---------------------------------------------------------------------
  #   Instance

  # Retourne l'affixe (nom sans extension) de self considéré comme
  # une path
  def affixe
    File.basename(self, File.extname(self))
  end

  def titleize
    t = self.downcase
    t[0] = t[0].upcase
    return t
  end

  def or_nil
    self.empty? ? nil : self
  end

  # Pour upcaser vraiment tous les caractères, même les accents et
  # les diacritiques
  DATA_MIN_TO_MAJ = {
    from: "àäéèêëîïùôöç",
    to:   "ÀÄÉÈÊËÎÏÙÔÖÇ"
  }
  alias :old_upcase :upcase
  def upcase
    self.old_upcase.tr(DATA_MIN_TO_MAJ[:from], DATA_MIN_TO_MAJ[:to])
  end

  alias :old_downcase :downcase
  def downcase
    self.old_downcase.tr(DATA_MIN_TO_MAJ[:to], DATA_MIN_TO_MAJ[:from])
  end

  # Pour transformer n'importe quel caractère de majuscule vers
  # minuscule, ou l'inverse.
  DATA_UPCASE = {
    :maj => "ÀÁÂÃÄÅĀĂĄÇĆĈĊČÐĎÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĸĺļľŀÑŃŅŇŊÒÓÔÕÖØŌŎŐŔŖŘŚŜŞŠÙÚÛÜŨŪŬŮŰŲŴÝŹŻŽ",
    :min => "àáâãäåāăąçćĉċčðďèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĹĻĽĿŁñńņňŋòóôõöøōŏőŕŗřśŝşšùúûüũūŭůűųŵýźżž"
  }
  def my_upcase
    self.tr(DATA_UPCASE[:min], DATA_UPCASE[:maj]).upcase
  end
  def my_downcase
    self.tr(DATA_UPCASE[:maj], DATA_UPCASE[:min]).downcase
  end


  # Chamelise ('mon_nom_tiret' => 'MonNomTiret')
  def camelize
    self.split('_').collect{|mot| mot.capitalize}.join("")
  end

  def decamelize
    self.gsub(/(.)([A-Z])/, '\1_\2').downcase
  end

  # Retourne le chemin d'accès self comme chemin relatif par rapport
  # au dossier HOME ou par rapport au dossier fourni
  #
  def relative_path in_folder = nil
    in_folder ||= Dir.home
    self.sub(/#{in_folder}/,'.')
  end

  # Pour ajouter l'extension '.+ext+' à un nom de fichier s'il ne
  # la contient pas (et seulement s'il ne la contient pas)
  def with_extension!(ext)
    str = self.dup
    str.end_with?(".#{ext}") || str.concat(".#{ext}")
    self.replace(self.with_extension(ext))
  end
  def with_extension(ext)
    str = self.dup
    str.end_with?(".#{ext}") || str.concat(".#{ext}")
    return str
  end

  def as_human_date(options = nil)
    Time.at(self).to_i.as_human_date(options)
  end
  def as_date(options=nil)
    Time.at(self).to_i.as_date(options)
  end

  # Méthode qui strip la chaine courante mais renvoie NIL si elle est vide.
  def strip_nil
    self.strip.or_nil
  end

  # Self est de la forme JJ/MM/YYYY et la méthode renvoie le
  # nombre de secondes correspondantes
  def as_seconds
    jrs, mois, ans = self.split('/').collect{|e| e.strip.to_i}
    return Time.new(ans, mois, jrs, 0,0,0).to_i
  end
  alias :to_seconds :as_seconds

  # Transformer les caractères diacritiques et autres en ASCII
  # simples
  unless defined? DATA_NORMALIZE
    DATA_NORMALIZE = {
      :from => "ÀÁÂÃÄÅàáâãäåĀāĂăĄąÇçĆćĈĉĊċČčÐðĎďĐđÈÉÊËèéêëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħÌÍÎÏìíîïĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓÔÕÖØòóôõöøŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšſŢţŤťŦŧÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽž",
      :to   => "AAAAAAaaaaaaAaAaAaCcCcCcCcCcDdDdDdEEEEeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOooooooOoOoOoRrRrRrSsSsSsSssTtTtTtUUUUuuuuUuUuUuUuUuUuWwYyyYyYZzZzZz"
    }
  end
  # ou def normalized
  def normalize
    self
      .force_encoding('utf-8')
      .gsub(/[œŒæÆ]/,{'œ'=>'oe', 'Œ' => 'Oe', 'æ'=> 'ae', 'Æ' => 'Ae'})
      .tr(DATA_NORMALIZE[:from], DATA_NORMALIZE[:to])
  end
  alias :normalized :normalize

end
