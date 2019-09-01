'use strict'

describe 'Analyse avec textes particuliers' do
  let(:ana) { @ana ||= begin
    a = TextAnalyzed.new('texte_avec_particularites.md', __FILE__)
    a.analyse
    a
  end }

  it 'a pu tout charger sans erreur' do
    expect(ana.resultat).not_to match('ERREUR')
  end

end
