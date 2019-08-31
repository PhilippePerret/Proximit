'use strict'

describe 'Lancement d’une analyse', current:true do
  before(:all) do
    full_path = File.expand_path("./spec/support/assets/textes/mon_fichier_simple.txt")
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    puts "@resultat = #{@resultat}"
  end
  it 'a pu tout charger' do
    expect(@resultat).not_to match('ERREUR')
  end
end
