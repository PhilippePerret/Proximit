# encoding: UTF-8
class TextAnalyzer
class Analyse

  # = main =
  #
  # Analyse des paths transmises
  #
  def assemble_texts_of_paths
    self.files = Hash.new
    nombre_traited = 0
    paths_count = paths.count
    paths.each_with_index do |path, path_index|
      afile = TextAnalyzer::AnalyzedFile.new(path, self)
      afile.index   = path_index
      afile.id      = path_index + 1
      afile.offset  = self.texte_entier.length
      self.files.merge!(afile.id => afile)
      self.texte_entier << afile.texte + String::RC * 2
      nombre_traited += 1
    end

    dbg('Nombre de fichiers à traiter', paths_count)
    dbg('Nombre de fichiers traités', nombre_traited)
    dbg('Longueur du texte entier', self.texte.entier.length)
    paths_count == nombre_traited || rt('textanalyzer.errors.nb_doc2treate_unmatch', {nb_expected: paths_count, nb_treated: nombre_traited})
    # Une erreur est produite si aucun texte n'est fourni
    raise("Aucun texte analysable n'a été fourni") if nombre_traited == 0
    return true
  end
  # /assemble_texts_of_paths

end #/Analyse
end #/TextAnalyzer
