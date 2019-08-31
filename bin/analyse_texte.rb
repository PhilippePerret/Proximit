#!/usr/bin/env ruby
# encoding: UTF-8

THISFOLDER  = File.dirname(__FILE__)
APPFOLDER   = File.dirname(THISFOLDER)
# Requérir tout le dossier
Dir["#{THISFOLDER}/first_required/**/*.rb"].each{|m|require m}
Dir["#{THISFOLDER}/TextAnalyzer/**/*.rb"].each{|m| require m}

# On analyse les paths donnés en argument
begin
  analyse = TextAnalyzer::Analyse.new(paths: ARGV)
  analyse.exec
rescue Exception => e
  puts "\033[0;31mERREUR : #{e.message}"
  puts "#{e.backtrace.join("\n")}\033[0m"
end
