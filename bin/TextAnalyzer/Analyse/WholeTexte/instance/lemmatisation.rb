=begin

  Toutes les méthodes pour la lemmatisation
  du texte.

=end
class TextAnalyzer
class Analyse
class WholeText

  NATURE_LEMMA_TO_SYMBOL = {
    'VER' => :verbe, 'DET' => :determinant, 'ADJ' => :adjectif, 'NOM' => :nom,
    'PRO' => :pronom, 'PRP' => :preposition, 'SENT' => :point, 'KON' => :kon,
    'ADV' => :adverbe, 'NUM' => :nombre, 'NAM' => :prenom,
    'ABR' => :abbreviation, # km => kilomètre
  }

  # Certaines valeurs sont mal corrigées par TreeTagger. Par exemple, 'lui' est
  # compris comme participe passé de 'luire', même dans la phrase "Son nom allait
  # désormais la salir comme lui." (Madame Bovary, Gustave Flaubert)
  LEMMA_AJUSTEMENT_CANON = {
    # Il arrive, si une erreur d'OCR s'est produite, que 'dans' arrive juste
    # avant un point ("dans.") et dans ce cas il est interprété comme le
    # pluriel de 'dan'.
    'dans'  => 'dans',
    'lui'   => 'lui' # au lieu de luire
  }

  TABLE_LEMMATISATION = {}

  # Lemmatisation du texte entier
  #
  # La lemmatisation correspond à l'analyse du texte par tree-tagger puis
  # au peuplement de la table volatile TABLE_LEMMATISATION qui contient
  # tous les mots et leur canon correspondant
  def lemmatize
    # On lemmatize tout le texte
    cmd = "cd '#{analyse.prox_folder}';/usr/local/bin/tree-tagger-french < ./texte_entier.txt > ./texte_entier_lemmatized.txt"
    # puts "cmd = #{cmd}"
    res = `#{cmd}`

    # On définit la table de lemmatisation
    peuple_table_lemma
  end

    # Méthode qui prépare la table TABLE_LEMMATISATION à partir du fichier
    # +path+ obtenu par la commande `tree-tagger-french`
    #
    # Noter que le fichier data contient d'autres informations comme par
    # exemple la nature du mot, qui pourrait être utilisé ultérieurement
    def peuple_table_lemma
      # À présent, on peut récupérer les données de lemmatisation et en faire
      # une table qui sera utilisée avec la relève des mots.
      File.open(lemma_file_path).each_with_index do |line, index_line|
        original, nature, canon = line.strip.split("\t")
        # original.length > 2   || next # on garde tous les mots maintenant
        canon != '<unknown>'  || next
        if canon.nil?
          puts "--- CANON EST NUL DANS (ligne #{index_line}) : #{line}".red
          next
        end
        original = original.downcase
        if original != canon
          # Rectifications nécessaire
          if LEMMA_AJUSTEMENT_CANON.key?(original)
            canon = LEMMA_AJUSTEMENT_CANON[original]
          end
          # Rien à faire si le mot est déjà connu
          TABLE_LEMMATISATION.key?(original) && next

          # canon peut avoir la forme 'essayer|essayer'
          canon.index('|') && begin
            canon = canon.split('|')[1]
            original != canon || next
          end
          # On prend ce mot
          TABLE_LEMMATISATION.merge!(original => data_nature_lemma_for(nature).merge(canon: canon))
        end
      end
    end
    # /peuple_table_lemma

    # Reçoit la nature du mot telle qu'elle est définie dans le fichier
    # lemmatisé entre le mot et le canon et retourne une version utilisable
    # ici, en table de hashage
    def data_nature_lemma_for nature_init
      nature, detail = nature_init.split(':')
      NATURE_LEMMA_TO_SYMBOL.key?(nature) || begin
        error('!!! La nature lemma "%s" n’est pas définie dans NATURE_LEMMA_TO_SYMBOL' % nature)
      end
      {nature: NATURE_LEMMA_TO_SYMBOL[nature] || nature, detail: detail}
    end

end #/WholeText
end #/Analyse
end #/TextAnalyzer
