# encoding: UTF-8
=begin
Se servir de cette grande classe Messagerie pour gérer tout l'aspect
des messages de l'appli.
=end

def debug msg
  puts "#{Time.now.to_i}--- DEBUG: #{msg}"
end

def error msg
  puts "#{Time.now.to_i}--- ERREUR: #{msg}"
  if msg.respond_to?(:backtrace)
    puts msg.backtrace
  end
end

def dbg label, valeur
  puts "#{Time.now.to_i}--- Valeur de '#{label}': #{valeur.inspect}"
end

class Messagerie


end #/Messagerie
