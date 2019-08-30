#!/usr/bin/env ruby
# encoding: UTF-8

THISFOLDER = File.dirname(__FILE__)

# Requérir tout le dossier
Dir["#{THISFOLDER}/TextAnalyzer/**/*.rb"].each{|m| require m}

# On analyse les paths donnés en argument
analyse = TextAnalyzer::Analyse.new(paths: ARGV)
analyse.exec
