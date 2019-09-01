# encoding: UTF-8
class TextAnalyzer
class Analyse
class WholeText

  MARK_BOT = '__PROX_BOT_PROX__' # Marque de début de texte
  MARK_EOT = '__PROX_EOT_PROX__'

  # Méthode qui traite le texte courant et récupère tous
  # ses mots pour les mettre dans la table +tableau+
  #
  def releve_mots

    tres = analyse.table_resultats

    # On commence par remplacer tous les caractères non alphanumérique par
    # des espaces (ponctuations, retour chariot), car sinon ils ne seraient
    # pas considérés par le scan.
    #
    # Note : la marque de début de texte (MARK_BOT) permet de tenir compte
    # des textes qui commenceraient par des caractères "effacés", des espaces,
    # etc. qui seraient supprimés plus bas dans la rechercher avec \b...\b
    t = "#{MARK_BOT} "+
      self.content
      .gsub(/\r/,'')
      .gsub(/’/,"'")
      .gsub(/'/,'e_ ') # les deux caractères ajoutés seront supprimés
      .gsub(/[\“\”]/, '"')
      .gsub(/[\#>\+\|\\\/\[\]\{\}\(\)\%«»"\,\n\.\¡\¿\!\?\;\…–—\: ]/, ' ') +
      " #{MARK_EOT}"
    # NE SURTOUT PAS METTRE '_' qui sert pour les tags retirés

    # On traite les mots complexes avec tirets qui doivent être traités
    # séparément comme "pourrais-je" ou "mi-raisin"
    t = t.gsub(/\-(#{AFTER_TIRET_BADS_ARR.join('|')})/,' \1')
         .gsub(/\b(#{BEFORE_TIRET_BADS_ARR.join('|')})\-/,'\1 ')

    # puts "\n\n\n--- texte épuré = #{t.inspect}"

    # On peut scanner le texte
    all_separated_words = t.scan(/\b(.+?)\b/)
    # puts "Tous les mots séparés : #{all_separated_words.inspect}"

    
    last_index_found = all_separated_words.count - 1

    # Contrairement à la version précédente (scrivener), on va travailler
    # avec une liste ne contenant que les mots, sans les espaces, et en
    # regrouper les tirets. Chaque mot sera une table contenant le mot et
    # son offset
    real_words = []
    final_word = nil
    cur_offset = 0
    while aword = all_separated_words.shift
      word = aword.first
      case word.strip
      when MARK_BOT
        # On met le décalage à la longueur de ce qui suit la marque de
        # début de texte, à laquelle on retire 1 pour l'espace qu'on a
        # ajouté après la marque pour la séparer d'un éventuel mot qui
        # commencerait le texte (ce qui est le cas général)
        cur_offset = all_separated_words.shift.first.length - 1
        next
      when MARK_EOT # on ne prend pas le dernier mot, on termine
        break
      when ''
        # Si un mot final est en court, on le mémorise
        if final_word
          real_words << {word:final_word, offset:cur_offset}
          cur_offset += final_word.length
          final_word = nil
        end
        # On ajoute la longueur de la séparation
        cur_offset += word.length
      when '-'
        # un tiret, on doit mettre le prochain mot avec celui-ci
        final_word << word
        final_word << all_separated_words.shift.first
      when /_$/
        final_word = word[0..-2]
        cur_offset -= 1
      else
        # Un vrai mot
        # puts "-- MOT: '#{word}' OFFSET #{cur_offset}"
        final_word = word
      end
    end
    # S'il en reste un à enregistrer
    if final_word
      real_words << {word:final_word, offset:cur_offset}
    end

    puts "real_words : #{real_words.inspect}"


    # On traite enfin tous les mots
    # =============================

    # Valeurs initiales
    # -----------------
    # Offset dans le texte total assemblé. On prend sa valeur initiale, à
    # laquelle on ajoutera toujours l'offset du mot courant
    init_current_offset =  tres.current_offset
    # Identifiant du fichier auquel appartiendra le mot
    current_file_id = get_current_file_id(tres.current_offset)

    # Début de la boucle
    while hword = real_words.shift

      # L'index de mot courant (noter qu'il sert aussi d'ID au mot)
      tres.current_index_mot += 1

      # L'offset du mot correspond à son offset dans le document (calculé
      # plus haut) auquel on ajoute l'offset du document auquel il appartient.
      tres.current_offset = init_current_offset + hword[:offset]

      mot = self.mots.create({
        analyse:          analyse,
        real:             hword[:word],
        offset:           tres.current_offset,
        relative_offset:  hword[:offset],
        index:            tres.current_index_mot,
        file_id:          current_file_id
      })

      # On ajoute le mot aux résultats
      tres.add_mot(mot)

    end #/ fin de la boucle sur tous les mots

    # Normalement, il faut ajouter 1 pour obtenir le vrai décalage dans
    # le fichier total, qui prend un retour de chariot en plus à la fin.
    tres.current_offset += 1
  end
  # /releve_mots

  def get_current_file_id offs
    # L'ID du fichier courant.
    # Pour le trouver, pour le moment, on cherche avec les Files de l'analyse,
    # dont l'instance contient l'offset dans le texte.
    file_index = nil
    from_file_offset_to_file_offset.each_with_index do |offset, file_index|
      offset < offs || (return file_index)
    end
    return from_file_offset_to_file_offset.count - 1
  end

  def from_file_offset_to_file_offset
    @from_file_offset_to_file_offset ||= begin
      analyse.files.collect do |file_id, file_ins|
        file_ins.offset
      end
    end
  end

end #/WholeText
end #/Analyse
end #/TextAnalyzer
