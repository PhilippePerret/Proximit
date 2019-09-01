'use strict'

# tests propres aux fichiers
class TextAnalyzed
  include RSpec::Matchers

  # Les fichier yaml/json des données de l'analyse (analyse.yaml)
  def has_correct_analyse_yaml_data?
    has_correct_analyse_data?(YAML.load_file(analyse_yaml_path))
  end
  def has_correct_analyse_json_data?
    has_correct_analyse_data?(JSON.parse(File.read(analyse_json_path)).to_sym)
  end
  def has_correct_analyse_data?(h)
    expect(h).to have_key :class
    expect(h[:class]).to eq 'TextAnalyzer::Analyse'
    expect(h).to have_key :datas
    proc_time = Proc.new do |ana, t|
      t = Time.parse(t) if t.is_a?(String)
      t > ana.start_time && t < ana.end_time
    end
    datas = h[:datas]
    [
      [:title, title], # à voir…
      [:folder, File.join(APPFOLDER,%w{spec support assets textes})],
      [:paths, [File.join(folder_textes, texte_name)]],
      [:text_analyzer_version, App.data[:version]],
      [:created_at, proc_time ],
      [:updated_at, proc_time ]
    ].each do |prop, value|
      expect(datas).to have_key prop
      if value.is_a?(Proc)
        expect(value.call(self, datas[prop])).to be true
      else
        expect(datas[prop]).to eq value
      end
    end
  end

  # Les fichier yaml/json des données de l'analyse (analyse.yaml)
  def has_correct_resultats_yaml_data?(hexpected)
    has_correct_resultats_data?(YAML.load_file(resultats_yaml_path), hexpected)
  end
  def has_correct_resultats_json_data?(hexpected)
    has_correct_resultats_data?(JSON.parse(File.read(resultats_json_path)).to_sym, hexpected)
  end
  def has_correct_resultats_data?(h, hexpected)
    expect(h).to have_key :class
    expect(h[:class]).to eq 'TextAnalyzer::Analyse::TableResultats'
    expect(h).to have_key :datas
    datas = h[:datas]
    expect(datas).to have_key :text_analyzer_version
    expect(datas).to have_key :canons
    expect(datas).to have_key :mots
    expect(datas).to have_key :proximites
    expect(datas).not_to have_key :segments
    # Dans les données attendues
    found_in_hash(datas, hexpected)
  end

  def found_in_hash actual, hexpected
    hexpected.each do |k, v|
      case v
      when Hash then found_in_hash(actual[k], v)
      else
        if actual[k] != v
          puts "Problème avec la propriété #{k.inspect} qui devrait valeur #{v.inspect} dans #{actual.inspect}"
        end
        expect(actual[k]).to eq v
      end
    end
  end

end #/TextAnalyzed

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

  it 'a construit la table des résultats en version YAML' do
    expect(File.exists? ana.resulats_yaml_path).to be true
    pending "Poursuivre"
  end

  it 'a construit la table des résultats en version javascript' do
    expect(File.exists? ana.resulats_json_path).to be true
    pending "Poursuivre"
  end

  it 'a construit le texte lemmatisé' do
    expect(File.exists? ana.fulltext_lemma_path).to be true
    pending "Poursuivre un peu"
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

  it 'a construit un fichier valide des résultats YAML de l’analyse', current: true do
    expect(File.exists? ana.analyse_yaml_path).to be true
    expect(ana).to have_correct_resultats_yaml_data({
        current_offset: 11,
        current_index_mot: 2,
        last_id_proximite: -1,
        proximites: {datas: {nombre: 0}}
      })
  end

  it 'a construit un fichier valide des résultats JSON de l’analyse', current: true do
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
