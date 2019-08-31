# encoding: UTF-8
class TextAnalyzer
class AnalyzedFile

  def initialize path, analyse = nil
    self.path     = path
    self.analyse  = analyse
  end


  # On identifiant, en commençant à 0
  # Son formated_id est mis à __DOC<id sur 3 chiffres>__ pour insertion
  # dans le texte complet.
  attr_accessor :id

  # Index du File dans son analyse. Pour pouvoir les récupérer dans
  # l'ordre, entendu que Analyse#files est une table avec l'object_id
  # du File en clé et l'instance en valeur.
  # Note : on pourrait aussi se servir du @id ci-dessus.
  attr_accessor :index

  # Chemin d'accès au fichier contenant le texte à analyser
  attr_accessor :path

  # {TextAnalyzer::Analyse} L'analyse en cours, ou nil si le fichier
  # n'est pas analysé dans le cadre d'une analyse de texte
  attr_accessor :analyse

  # {Integer} Décalage, dans le fichier du texte complet, de ce
  # fichier (pour retrouver les documents des mots)
  attr_accessor :offset

  # Instance {String} du texte du fichier
  # C'est toujours un texte simple, il est transformé à l'aide de textutil
  # en fonction de son format.
  def texte
    @texte ||= begin
      File.read(path)#.force_encoding('utf-8')
    end
  end

  # Retourne un {Hash} des données du format fichier (cf. constantes.rb)
  def format
    @format ||= EXTENSION2FORMAT[extension]
  end

  def affixe
    @affixe ||= File.basename(path, extension)
  end

  def extension
    @extension ||= File.extname(path)
  end

end #/AnalyzedFile
end #/TextAnalyzer
