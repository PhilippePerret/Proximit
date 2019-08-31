# encoding: UTF-8
=begin
Pour obtenir quelques éléments de l'application
=end
class App
class << self

  def data
    @data ||= begin
      JSON.parse(read_from_file(package_path)).to_sym
    end
  end

  def package_path
    @package_path ||= File.join(APPFOLDER,'package.json')
  end
end #<< self
end # App
