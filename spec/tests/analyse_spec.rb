'use strict'

def in_folder_prox relpath
  File.join(folder_prox,relpath)
end
def folder_prox
  @folder_prox ||= File.join(folder_textes,'mon_fichier_simple_prox')
end

describe 'Lancement d’une analyse' do
  before(:all) do
    FileUtils.rm_rf(folder_prox) if File.exists?(folder_prox)
    full_path = File.expand_path("./spec/support/assets/textes/mon_fichier_simple.txt")
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    puts "@resultat = #{@resultat}"
  end
  it 'a pu tout charger sans erreur' do
    expect(@resultat).not_to match('ERREUR')
  end
  it 'a construit le dossier de proximité' do
    p = File.join(folder_textes,'mon_fichier_simple_prox')
    expect(File.exists? p).to be true
    expect(File.directory? p).to be true
  end
  it 'a construit le fichier du texte intégral avec seulement les mots' do
    p = in_folder_prox('texte_entier.txt')
    expect(File.exists? p).to be true
    expect(File.read(p).strip).to eq "Un simple texte."
  end
  it 'a construit le fichier du texte intégral en version YAML' do
    p = in_folder_prox('whole_text.yaml')
    expect(File.exists? p).to be true
    whole = YAML.load_file(p)
    # puts "whole : #{whole.inspect}"
    expect(whole[:datas][:length]).to eq 19
    expect(whole[:datas][:pages_count]).to eq 1
    mots = whole[:datas][:mots][:datas]
    expect(mots[:count]).to eq 3
    expect(mots[:items]).to have_key(0)
    expect(mots[:items]).to have_key(1)
    expect(mots[:items]).to have_key(2)
  end
end


describe 'Analyse avec textes particuliers' do
  def in_folder_prox relpath
    File.join(folder_prox,relpath)
  end
  def folder_prox
    @folder_prox ||= File.join(folder_textes,'mon_fichier_simple_prox')
  end

  before(:all) do
    FileUtils.rm_rf(folder_prox) if File.exists?(folder_prox)
    full_path = File.expand_path("./spec/support/assets/textes/mon_fichier_simple.txt")
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    puts "@resultat = #{@resultat}"
  end
  it 'a pu tout charger sans erreur' do
    expect(@resultat).not_to match('ERREUR')
  end

end
