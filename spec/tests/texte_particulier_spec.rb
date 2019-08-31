'use strict'

def in_folder_prox relpath
  File.join(folder_prox,relpath)
end
def folder_prox
  @folder_prox ||= File.join(folder_textes,'texte_avec_particularites_prox')
end

describe 'Analyse avec textes particuliers' do

  before(:all) do
    FileUtils.rm_rf(folder_prox) if File.exists?(folder_prox)
    full_path = File.expand_path("./spec/support/assets/textes/texte_avec_particularites.md")
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    puts "@resultat = #{@resultat}"
  end
  it 'a pu tout charger sans erreur' do
    expect(@resultat).not_to match('ERREUR')
  end

end
