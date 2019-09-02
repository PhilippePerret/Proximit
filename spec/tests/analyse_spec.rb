'use strict'
describe 'Lancement d’une analyse' do
  let(:ana) { @ana }
  before(:all) do
    @ana ||= begin
      a = TextAnalyzed.new('mon_fichier_simple.txt', __FILE__)
      a.analyse(verbose = false)
      a
    end
  end
  it 'a pu tout charger sans erreur' do
    expect(ana.resultat).not_to match('ERREUR')
  end

  it 'a construit le dossier de proximité' do
    p = File.join(folder_textes,'mon_fichier_simple_prox')
    expect(File.exists? p).to be true
    expect(File.directory? p).to be true
  end
  it 'a construit le fichier du texte intégral avec seulement les mots' do
    expect(File.exists? ana.fulltext_txt_path).to be true
    expect(File.read(ana.fulltext_txt_path).strip).to eq "Un simple texte."
  end
  it 'a construit le fichier du texte intégral en version YAML' do
    expect(File.exists? ana.text_yaml_path).to be true
    whole = YAML.load_file(ana.text_yaml_path)
    # puts "whole : #{whole.inspect}"
    expect(whole[:datas][:length]).to eq 19
    expect(whole[:datas][:pages_count]).to eq 1
    mots = whole[:datas][:mots][:datas]
    expect(mots[:count]).to eq 3
    expect(mots[:items]).to have_key(0)
    expect(mots[:items]).to have_key(1)
    expect(mots[:items]).to have_key(2)
  end

  it 'a construit le texte lemmatisé' do
    expect(File.exists? ana.fulltext_lemma_path).to be true
    code = File.read(ana.fulltext_lemma_path)
    expect(code).to include 'Un	DET:ART	un'
    expect(code).to include 'simple	ADJ	simple'
    expect(code).to include 'texte	NOM	texte'
    expect(code).to include '.	SENT	.'
  end

  it 'a construit le fichier des données YAML (data.yaml)' do
    expect(File.exists? ana.data_yaml_path).to be true
    expect(ana).to have_correct_yaml_data
  end

  it 'a construit le fichier des données JSON (data.json)' do
    expect(File.exists? ana.data_json_path).to be true
    expect(ana).to have_correct_json_data
  end

  it 'a construit le fichier des données YAML de l’analyse (analyse.yaml)' do
    expect(File.exists? ana.analyse_yaml_path).to be true
    expect(ana).to have_correct_analyse_yaml_data
  end

  it 'a construit un fichier valide des données JSON de l’analyse (analyse.json)' do
    expect(File.exists? ana.analyse_json_path).to be true
    expect(ana).to have_correct_analyse_json_data
  end

  it 'a construit un fichier valide des résultats YAML de l’analyse' do
    expect(File.exists? ana.analyse_yaml_path).to be true
    expect(ana).to have_correct_resultats_yaml_data({
        current_offset: 11,
        current_id_mot: 2,
        last_id_proximite: -1,
        proximites: {datas: {nombre: 0}}
      })
  end

  it 'a construit un fichier valide des résultats JSON de l’analyse' do
    expect(File.exists? ana.analyse_json_path).to be true
    expect(ana).to have_correct_resultats_json_data({

      })
  end
end


describe 'Analyse avec textes particuliers' do

  let(:ana2) { @ana2 ||=begin
    a = TextAnalyzed.new('mon_fichier_simple.txt', __FILE__)
    a.analyse(true)
    a
  end }

  it 'a pu tout charger sans erreur' do
    expect(ana2.resultat).not_to match('ERREUR')
  end

end
