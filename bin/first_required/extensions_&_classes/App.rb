# encoding: UTF-8
=begin
Pour obtenir quelques éléments de l'application

ATTENTION : ce module est chargé par les tests (avec quelques autres modules
de l'analyse mais seulement quelques uns)

=end
class App
class << self

  def data
    @data ||= begin
      if STANDALONE || !File.exists?(package_path)
        {'version' => File.read(File.join(THISFOLDER,'VERSION')).strip}
      else
        JSON.parse(File.read(package_path).force_encoding('utf-8')).to_sym
      end
    end
  end

  def package_path
    @package_path ||= File.join(APPFOLDER,'package.json')
  end
end #<< self
end # App
