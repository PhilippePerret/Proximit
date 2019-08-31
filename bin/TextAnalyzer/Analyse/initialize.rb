# encoding: UTF-8
class TextAnalyzer
class Analyse

  # Instanciation d'une nouvelle analyse
  #
  # Une analyse est l'élément racine d'un analyse de textes, qu'elle provienne
  # d'un projet Scrivener ou d'un simple texte donné à analyser.
  #
  # +data+  {Hash} Donnée pour décrire l'analyse à faire. C'est ici par
  #         exemple qu'on pourrait définir que c'est un projet Scrivener.
  #         :path ou :file    Pour définir le path d'un fichier à analyser
  #                           S'il termine par l'extension .scriv, c'est un
  #                           projet Scrivener
  #         :folder       Peut indiquer le dossier dans lequel mettre l'analyse
  #                       C'est dans ce dossier que sera créé le dossier
  #                       `.textanalyzer`
  #         {String} +data+ peut être aussi simplement le path du fichier
  #                  à analyser.
  def initialize data = nil
    data.is_a?(Hash) || data = {paths: data}
    treate_data(data)
  end

  # Initialisation de l'analyse
  # ---------------------------
  # Appelée au tout début, avant de procéder à l'analyse proprement dite
  #
  def init_analyse
    @data = Data.new(self)

    # Données générales pour l'analyse
    data.paths      = paths
    data.started_at = Time.now

    # Faire le dossier d'analyse
    File.exists?(prox_folder) || FileUtils.mkdir_p(prox_folder)

    # Pour initialiser les "listes rectifiées" et les listes
    # de proximités propres au projet.
    TableResultats::Proximite.init(self)

    # Remet tous les compteurs à zéro
    table_resultats.reset

    # Remet les compteurs à zéro, détruit le fichier
    # s'il existe déjà
    texte_entier.reset
  rescue Exception => e
    error(e)
    return false
  else
    return true
  end

  # RETURN true si les données connues sont valides, pour pouvoir passer
  # à l'analyse du texte.
  def data_valid?
    # Un path doit absolument avoir été transmis à l'instanciation (vraiment ?)
    self.paths.is_a?(Array) || raise("Il faut fournir une liste de paths, même pour un texte unique.")

    # On doit vérifier que chaque path existe. On en profite pour relever
    # leur date de dernière modification pour pouvoir régler le
    # :original_doc_modified_at si :modified_at n'est pas fourni
    arr_modified_at = Array.new
    self.paths.each do |p|
      File.exist?(p) || raise("Texte introuvable %{pth}" % {pth: p})
      arr_modified_at << File.stat(p).mtime
    end
    self.original_doc_modified_at ||= arr_modified_at.max
  end

  # Traitement des datas qui sont fournies à l'instanciation de
  # l'analyse
  # Noter que lorsqu'on checke seulement l'existence de l'analyse par exemple,
  # on n'a pas besoin de fournir de paths. Donc, ici, on prend seulement les
  # données fournies. On utilisera la méthode `data_valid?` pour savoir si les
  # données sont valides pour procéder à l'analyse.
  def treate_data data
    data ||= {}

    # Les fichiers à traiter, s'ils sont envoyés lors de l'instanciation
    if data[:path]
      self.paths = [ data[:path] ]
    elsif data[:paths]
      self.paths = data[:paths]
    end

    dbg('analyse.paths', paths.inspect)

    # Le dossier de l'analyse. Il doit être possible de le déterminer
    # dès l'instanciation.
    # + le premier fichier à analyser
    self.folder =
      if data.key?(:folder)
        data[:folder]
        self.first_path = Dir["#{data[:folder]}/*.{#{available_extensions.join(',')}}"].first
      elsif
        self.first_path = self.paths.first
        File.expand_path(File.dirname(self.first_path))
      else
        raise("Impossible de déterminer le dossier des fichiers de l'analyse…")
      end

    dbg("analyse.folder", folder)

    # Le dossier (plus caché) qui va contenir tous les fichiers produits par
    # l'analyse. C'est l'affixe du premier fichier auxquel est ajouté '_prox'
    # Note : ça n'est pas ici qu'on le construit (pour respecter la fonction
    # des méthodes — celle-ci doit juste servir à récupérer les données)
    self.prox_folder = File.join(folder,"#{File.basename(first_path,File.extname(first_path))}_prox")

    dbg('analyse.prox_folder', prox_folder)

    # D'autres informations qui ont pu être passées par les données
    {
      title:        :title,
      modified_at:  :original_doc_modified_at
    }.each do |prop_from, prop_to|
      self.send('%s=' % prop_to, data[prop_from])
    end

  end

end #/Analyse
end #/TextAnalyzer
