# encoding: UTF-8
# tests propres aux fichiers
class TextAnalyzed
  include RSpec::Matchers

  def has_correct_yaml_data? hexpected = nil
    has_correct_data?(YAML.load_file(data_yaml_path), hexpected)
  end
  def has_correct_json_data? hexpected = nil
    has_correct_data?(JSON.parse(File.read(data_json_path)).to_sym, hexpected)
  end
  def has_correct_data?(h, hexpected)
    expect(h).to have_key :class
    expect(h[:class]).to eq 'TextAnalyzer::Analyse::Data'
    expect(h).to have_key :datas
    datas = h[:datas]
    expect(datas).to have_key :text_analyzer_version
    expect(datas[:text_analyzer_version]).to eq App.data[:version]
    expect(datas).to have_key :paths
    expect(datas[:paths]).to eq ["./#{texte_name}"]
    started_at = datas[:started_at]
    started_at = Time.parse(started_at) if started_at.is_a?(String)
    expect(started_at.to_i).to be >= self.start_time.to_i
    ended_at = datas[:ended_at]
    ended_at = Time.parse(ended_at) if ended_at.is_a?(String)
    expect(ended_at.to_i).to be >= self.start_time.to_i
    expect(ended_at.to_i).to be <= self.end_time.to_i
  end

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
      [:paths, [File.join(folder_textes,texte_name)]],
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
