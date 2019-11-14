#!/usr/bin/env ruby
# encoding: UTF-8

STANDALONE = $0 == __FILE__

THISFOLDER  = File.dirname(__FILE__)
APPFOLDER   = File.expand_path(File.dirname(THISFOLDER))

# puts "APPFOLDER : #{APPFOLDER}"

# Requérir tout le dossier
Dir["#{THISFOLDER}/first_required/**/*.rb"].each{|m|require m}
Dir["#{THISFOLDER}/TextAnalyzer/**/*.rb"].each{|m| require m}

# On analyse les paths donnés en argument
begin
  analyse = TextAnalyzer::Analyse.new(paths: ARGV)
  analyse.exec
  # À partir d'ici, les fichiers résultats onté été créés
  if STANDALONE
    # <= Ce module est appelé directement (en CLI)
    # => Il faut afficher les résultats où les moyens de les obtenir
    puts "Je vais afficher les résultats."
  end
rescue Exception => e
  puts "\033[0;31mERREUR : #{e.message}"
  puts "#{e.backtrace.join("\n")}\033[0m"
end
