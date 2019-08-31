# encoding: UTF-8
class TextAnalyzer
class << self
  def current_version
    @current_version ||= App.data[:version]
  end
  alias :version :current_version
end #/<< self
end #/TextAnalyzer
