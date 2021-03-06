# encoding: UTF-8
#
# version 1.3.3
#
# Note version 1.3.3
#   Ajout de la propriété :indent dans les options envoyées à la
#   méthode truncate, pour ajouter une indentation.
# Note version 1.3.2
#   Ajout du calcul du nombre de lignes et de colonnes de l'écran et
#   de la méthode `console_delimitor` qui permet de tracer une ligne
#   sur presque tout l'écran.
# Note version 1.3.1
#   Ajout de la couleur noir sur blanc (noirsurblanc)
# Note version 1.3.0
#   Méthode String.rgb pour mettre n'importe quelle couleur en console.
#

class String


  def self.console_delimitor(char = '-')
    char * (screen_columns - 4)
  end
  # Retourne le nombre de colonnes actuelles sur l'écran
  def self.screen_columns
    `tput cols`.to_i
  end
  def self.screen_lines
    `tput lines`.to_i
  end

  # Attention : retourne un Array des lignes ajustées
  # +options+
  #   :justify      True => justifier le texte
  #   :indent       Retrait de chaque ligne.
  def self.truncate str, line_len, options = nil
    options ||= Hash.new
    truncate_and_justify(str, line_len, options.merge(justify: false))
  end

  def self.truncate_and_justify str, line_len, options = nil
    options ||= Hash.new
    options.key?(:justify)  || options.merge!(justify: true)
    options.key?(:indent)   || options.merge!(indent: '')
    # Les lignes qui seront renvoyées
    lines = Array.new
    paragraphes = str.split(String::RC)
    paragraphes.each do |paragraphe|

      # Si le paragraphe est inférieur à la largeur de la ligne,
      # on peut le mettre en ligne et passer au suivant
      paragraphe.length > line_len || begin
        lines.empty? || paragraphe.prepend(options[:indent])
        lines << paragraphe
        next
      end

      # Maintenant, on fait des lignes de la bonne longueur
      mots = paragraphe.split(/[  ]/)

      paragraphe_lines = Array.new
      begin
        mots_line = Array.new
        while mots.first && ((mots_line).join(' ') + " #{mots.first}").length < line_len
          mots_line << mots.shift
        end
        # puts "mots_line: #{mots_line.inspect} / len = #{mots_line.join(' ').length}"
        options[:justify] || mots_line = mots_line.join(' ')
        paragraphe_lines.empty? || mots_line.prepend(options[:indent])
        paragraphe_lines << mots_line
      end until mots.empty?

      if options[:justify]
        # On justifie toutes les lignes sauf la dernière
        paragraphe_lines[0..-2].each_with_index do |mline, index_line|
          final_line = justify(mline, line_len)
          paragraphe_lines[index_line] = final_line
        end
        paragraphe_lines[-1] = paragraphe_lines[-1].join(' ')
      end #/ justify

      lines << paragraphe_lines.join("\n")
    end

    return lines
  end

  # On justifie la ligne +line+ à la longueur +line_width+
  def self.justify(line, line_width)
    line.is_a?(Array) || line = line.split(' ')
    imot = 0
    nombre_mots = line.count

    while line.join(' ').strip.length < line_width
      imot += 1
      line[ -imot ] += ' '
      imot < nombre_mots || imot = 0
    end
    return line.join(' ')
  end
  # /justify

  # truncate le texte
  def segmente longueur, heading = ''
    li  = Array.new
    # Il faut traiter le cas où le texte contient des retours chariots
    self.split(RET).each do |seg|
      while seg.length > longueur
        ri = seg.rindex(' ', longueur)
        ri || break
        li << seg[0..ri]
        seg = seg[ri+1..-1]
      end
      seg.length > 0 && li << seg
    end
    return heading + li.join("\n#{heading}")
  end
  # /segmente

  # Un brun italique sur blanc
  def gitalsurblanc
    "\033[3;7;43m#{self}\033[0m"
  end

  # Gris (très clair) italique sur blanc
  def grisitalsurblanc
    "\033[3;7;47m#{self}\033[0m"
  end

  def noirsurblanc
    "\033[0;7m#{self}\033[0m"
  end
  # Le texte en bleu gras pour le terminal
  def bleu_gras
    "\033[1;96m#{self}\033[0m"
  end
  # Le texte en bleu gras pour le terminal
  def bleu
    "\033[0;96m#{self}\033[0m"
    # 96=bleu clair, 93 = jaune, 94/95=mauve, 92=vert
  end
  alias :blue :bleu

  def mauve
    "\033[1;94m#{self}\033[0m"
  end

  # Pour obtenir un texte de n'importe quelle couleur, à utiliser en
  # console, à partir d'un trio [R, G, B]
  # Par exemple 'Mon texte rouge pâle'.rgb([255, 40, 40])
  def rgb( vcolors )
    "%s%s\033[0m" % [Colors.color_for_console(vcolors), self]
  end

  def fond1
    "\033[38;5;8;48;5;45m#{self}\033[0m"
  end
  def fond2
    "\033[38;5;8;48;5;40m#{self}\033[0m"
  end
  def fond3
    "\033[38;5;0;48;5;183m#{self}\033[0m"
  end
  def fond4
    "\033[38;5;15;48;5;197m#{self}\033[0m"
  end
  def fond5
    "\033[38;5;15;48;5;172m#{self}\033[0m"
  end

  def jaune
    "\033[0;93m#{self}\033[0m"
  end

  def vert
    "\033[0;92m#{self}\033[0m"
  end

  # Le texte en rouge gras pour le terminal
  def rouge_gras
    "\033[1;31m#{self}\033[0m"
  end

  # Le texte en rouge gras pour le terminal
  def rouge
    "\033[0;91m#{self}\033[0m"
  end
  alias :red :rouge

  def rouge_clair
    "\033[0;35m#{self}\033[0m"
  end

  def gris
    "\033[0;90m#{self}\033[0m"
  end

  # Le texte en gras pour le terminal
  def gras
    "\033[1m#{self}\033[0m"
  end

  # Le string dont on a retiré les couleurs
  def sans_couleur
    self.gsub(/\e\[(.*?)m/,'').gsub(/\\e\[(.*?)m/,'')
  end

  def underlined with = '-', heading = ''
    return "#{self}\n#{heading}#{with * self.length}"
  end


end
