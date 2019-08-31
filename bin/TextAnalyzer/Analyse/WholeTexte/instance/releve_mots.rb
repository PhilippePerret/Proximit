# encoding: UTF-8
class TextAnalyzer
class Analyse
class WholeText

  MARK_EOT = '__PROX_EOT_PROX__'

  # Méthode qui traite le texte courant et récupère tous
  # ses mots pour les mettre dans la table +tableau+
  #
  def releve_mots

    tres = analyse.table_resultats

    # On commence par remplacer tous les caractères non alphanumérique par
    # des espaces (ponctuations, retour chariot), car sinon ils ne seraient
    # pas considérés par le scan.
    t = self.content
      .gsub(/\r/,'')
      .gsub(/’/,"'")
      .gsub(/'/,'e ')
      .gsub(/[\“\”]/, '"')
      .gsub(/[>\+\|\\\/\[\]\{\}\(\)\%«»"\,\n\.\¡\¿\!\?\;\…–—\: ]/, ' ') +
      " #{MARK_EOT}"
    # NE SURTOUT PAS METTRE '_' qui sert pour les tags retirés

    # On traite les mots complexes avec tirets qui doivent être traités
    # séparément comme "pourrais-je" ou "mi-raisin"
    t = t.gsub(/\-(#{AFTER_TIRET_BADS_ARR.join('|')})/,' \1')
         .gsub(/\b(#{BEFORE_TIRET_BADS_ARR.join('|')})\-/,'\1 ')

    puts "t = #{t.inspect}"


    # On peut scanner le texte
    all_separated_words = t.scan(/\b(.+?)\b/)
    puts "Tous les mots séparés : #{all_separated_words.inspect}"
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
      break if word === MARK_EOT # on ne prend pas le dernier mot
      if word.strip === ''
        # Si un mot final est en court, on le mémorise
        if final_word
          real_words << {word:final_word, offset:cur_offset}
          cur_offset += final_word.length
          final_word = nil
        end
        # On ajoute la longueur de la séparation
        cur_offset += word.length
      elsif word === '-'
        # un tiret, on doit mettre le prochain mot avec celui-ci
        final_word << word
        final_word << all_separated_words.shift.first
      else
        # Un vrai mot
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
    # l'offset dans ce document-ci (offset relatif)
    rel_offset = 0
    # Offset dans le texte total assemblé. On prend sa valeur initiale, à
    # laquelle on ajoutera toujours l'offset du mot courant
    init_current_offset =  tres.current_offset
    # Identifiant du fichier auquel appartiendra le mot
    current_file_id = get_current_file_id(tres.current_offset)

    # Début de la boucle
    while hword = real_words.shift

      # L'index de mot courant (noter qu'il sert aussi d'ID au mot)
      tres.current_index_mot += 1

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

      # On prend le nouveau décalage
      tres.current_offset = init_current_offset + hword[:offset]

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
