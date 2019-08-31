# encoding: UTF-8
class TextAnalyzer
class AnalyzedFile

  EXTENSION2FORMAT = {
    '.doc'      => {hname: 'Microsoft Word',  key: 'WORD'},
    '.docx'     => {hname: 'Microsoft Word',  key: 'WORD'},
    '.odt'      => {hname: 'LibreOffice',     key: 'LIBO'},
    '.text'     => {hname: 'Simple text',     key: 'TEXT'},
    '.txt'      => {hname: 'Simple text',     key: 'TEXT'},
    '.tex'      => {hname: 'Latex',           key: 'LTEX'},
    '.md'       => {hname: 'Markdown',        key: 'MDOW'},
    '.markdown' => {hname: 'Markdown',        key: 'MDOW'},
    '.pages'    => {hname: 'Pages',           key: 'PAGE'},
    '.scriv'    => {hname: 'Scrivener',       key: 'SCRV'}
  }

end #/AnalyzedFile
end #/TextAnalyzer
