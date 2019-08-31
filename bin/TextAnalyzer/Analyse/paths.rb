# encoding: UTF-8
class TextAnalyzer
class Analyse

  # Fichier pour enregistrer les données
  def yaml_file_path
    @yaml_file_path ||= File.join(prox_folder,'analyse.yaml')
  end

end #/Analyse
end #/TextAnalyzer
