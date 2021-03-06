# encoding: UTF-8
=begin

  Méthodes pratiques pour les mots

=end
class TextAnalyzer
class Analyse

  def mots
    table_resultats.mots
  end

  def all_mots
    texte_entier.mots
  end

  # Return instance Mot of id +mot_id+
  def get_mot_by_id(mot_id)
    texte_entier.mot(mot_id)
  end
  # Retourne l'instance {...WholeText::Mot} du mot de :lemma +lemma+
  # Renvoie en fait la première instance
  def mot lemma
    texte_entier.mots[mots[lemma].first]
  end

end #/Analyse
end #/TextAnalyzer
