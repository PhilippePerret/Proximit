# encoding: UTF-8

class TextAnalyzed
  attr_reader :texte_name
  attr_reader :resultat
  # Temps de démarrage et de fin de l'analyse
  attr_reader :start_time, :end_time
  attr_reader :test_file # le fichier test depuis lequel on appelle
  # l'instanciation
  def initialize texte_name, test_file
    @texte_name = texte_name
    @test_file  = test_file.sub(/^#{APPFOLDER}\//,'')
  end
  def analyse(verbose = false)
    if verbose
      tfile = test_file ? " (appelé depuis #{test_file})" : ""
      puts "\n\n\nJe procède à l'analyse du fichier '#{texte_name}'#{tfile}"
    end
    FileUtils.rm_rf(prox_folder) if File.exists?(prox_folder)
    full_path = File.expand_path("./spec/support/assets/textes/#{texte_name}")
    @start_time = Time.now
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    @end_time = Time.now
    if verbose
      puts "\n\n---- @resultat = #{@resultat}"
    end
  end

  # Retourne le path complet du fichier +relpath+ dans le dossier des proximités
  # de cette analyse (de ce texte analysé ou du premier de la liste)
  def in_prox_folder relpath
    File.join(prox_folder,relpath)
  end

  # Le dossier des proximités
  def prox_folder
    @prox_folder ||= File.join(folder_textes,"#{affixe}_prox")
  end

  # Souvent, le texte est placé dans un dossier qui porte le nom
  # du projet. On le met en titre (même s'il vaudrait mieux que ce
  # soit un container)
  def title
    @title ||= File.basename(File.dirname(prox_folder))
  end

  # Les paths des fichiers de l'analyse
  # -----------------------------------
  def data_yaml_path
    @data_yaml_path ||= in_prox_folder('data.yaml')
  end
  def data_json_path
    @data_json_path ||= in_prox_folder('data.json')
  end
  def analyse_yaml_path
    @analyse_yaml_path ||= in_prox_folder('analyse.yaml')
  end
  def analyse_json_path
    @analyse_json_path ||= in_prox_folder('analyse.json')
  end
  def resultats_yaml_path
    @resultats_yaml_path ||= in_prox_folder('table_resultats.yaml')
  end
  def resultats_json_path
    @resultats_json_path ||= in_prox_folder('table_resultats.json')
  end
  def text_yaml_path
    @text_yaml_path ||= in_prox_folder('whole_text.yaml')
  end
  def fulltext_txt_path
    @fulltext_txt_path ||= in_prox_folder('texte_entier.txt')
  end
  def fulltext_lemma_path
    @fulltext_lemma_path ||= in_prox_folder('texte_entier_lemmatized.txt')
  end

  def affixe
    @affixe ||= File.basename(texte_name,File.extname(texte_name))
  end
end
