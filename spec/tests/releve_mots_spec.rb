'use strict'

class TextAnalyzed
  attr_reader :texte_name
  attr_reader :resultat
  def initialize texte_name
    @texte_name = texte_name
  end
  def analyse
    FileUtils.rm_rf(prox_folder) if File.exists?(prox_folder)
    full_path = File.expand_path("./spec/support/assets/textes/#{texte_name}")
    @resultat = `./bin/analyse_texte.rb "#{full_path}"`
    puts "@resultat = #{@resultat}"
  end
  def in_prox_folder relpath
    File.join(prox_folder,relpath)
  end
  def prox_folder
    @prox_folder ||= File.join(folder_textes,"#{affixe}_prox")
  end
  def affixe
    @affixe ||= File.basename(texte_name,File.extname(texte_name))
  end
end

describe 'La relève des mots' do

  it 'affecte les bonnes données aux mots', current:true do
    ana = TextAnalyzed.new('texte_avec_particularites.md')
    ana.analyse
    expect(ana.resultat).not_to match('ERREUR')
    p = ana.in_prox_folder('whole_text.yaml')
    expect(File.exists? p).to be true
    whole = YAML.load_file(p)
    ptexte_entier = ana.in_prox_folder('texte_entier.txt')
    expect(File.exists? ptexte_entier).to be true
    texte_complet = File.read(ptexte_entier)
    mots = whole[:datas][:mots][:datas]
    expect(mots[:items]).to have_key(0)
    expect(mots[:items]).to have_key(1)
    expect(mots[:items]).to have_key(2)
    lesmots = mots[:items]
    [
      # index, mot_init, offset, length, downcase, canon
      [0, 'Un', 2, 2, 'un', 'un'],
      [2, 'Un', 12, 2, 'un', 'un'],
      [6, 'été', 38, 3, 'été', 'été'],
      [10, 'avale', 52, 5, 'avale', 'avaler']
    ].each do |dmot|
      m = lesmots[dmot.first][:datas]
      # puts "--- mots[#{dmot.first}] : #{m.inspect}"
      [:index, :real_init, :offset, :length, :downcase, :canon].each_with_index do |prop, iprop|
        # puts "iprop=#{iprop.inspect}, prop=#{prop.inspect}"
        expect(m[prop]).to eq dmot[iprop]
        # On prend l'extrait du texte correspondant pour voir si ça matche
        offset = m[:offset]
        length = m[:length]
        expect(texte_complet[offset...(offset+length)]).to eq m[:real_init]
      end
    end
  end

end
