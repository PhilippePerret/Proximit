#!/usr/bin/env ruby # -wKU
# encoding: UTF-8

puts "Version #{RUBY_VERSION}"
puts "Je vais procéder à l'analyse du texte #{ARGV[0]}."

THISFOLDER = File.dirname(__FILE__)

# Requérir tout le dossier
Dir["#{THISFOLDER}/TextAnalyzer/**/*.rb"].each{|m| require m}

analyse = TextAnalyzer::Analyse.new(paths: ARGV)
analyse.exec
