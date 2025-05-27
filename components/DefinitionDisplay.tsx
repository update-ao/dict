
import React from 'react';
import { DefinitionEntry, Meaning, Definition as DefType } from '../types';
import { TRANSLATIONS } from '../constants';
import AudioPlayerButton from './AudioPlayerButton';

interface WordLinkProps {
  word: string;
  onClick: (word: string) => void;
}

const WordLink: React.FC<WordLinkProps> = ({ word, onClick }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick(word);
    }}
    className="text-blue-600 hover:underline cursor-pointer"
    aria-label={`Search for definition of ${word}`}
  >
    {word}
  </button>
);

interface DefinitionItemProps {
  def: DefType;
  onWordClick: (word: string) => void; 
  showExampleForThisDef: boolean; 
}

const DefinitionItem: React.FC<DefinitionItemProps> = ({ def, showExampleForThisDef }) => {
  return (
    <li>
      <p>{def.definition}</p>
      {showExampleForThisDef && def.example && (
        <p className="text-gray-500 italic mt-0.5" aria-label="Example">
          {TRANSLATIONS.example}: "{def.example}"
        </p>
      )}
    </li>
  );
};

interface MeaningItemProps {
  meaning: Meaning;
  onWordClick: (word: string) => void;
}

const MAX_EXAMPLES_PER_PART_OF_SPEECH = 1;

const MeaningItem: React.FC<MeaningItemProps> = ({ meaning, onWordClick }) => {
  const definitionsToDisplay = meaning.definitions; 
  let examplesShownCount = 0;

  // App.tsx now ensures meaning.synonyms and meaning.antonyms are correctly sized and de-duplicated.
  const displaySynonyms = meaning.synonyms || [];
  const displayAntonyms = meaning.antonyms || [];

  return (
    <div className="mb-3">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 capitalize">{meaning.partOfSpeech}</h3>
      
      {displaySynonyms.length > 0 && (
        <div className="mt-1 mb-2 ml-5 text-sm">
          <h4 className="font-semibold text-gray-700 inline">{TRANSLATIONS.synonyms}: </h4>
          <span className="text-gray-600">
            {displaySynonyms.map((syn, index, arr) => (
              <React.Fragment key={syn + index}>
                <WordLink word={syn} onClick={onWordClick} />
                {index < arr.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        </div>
      )}

      {displayAntonyms.length > 0 && (
        <div className="mt-1 mb-2 ml-5 text-sm">
          <h4 className="font-semibold text-gray-700 inline">{TRANSLATIONS.antonyms}: </h4>
          <span className="text-gray-600">
            {displayAntonyms.map((ant, index, arr) => (
              <React.Fragment key={ant + index}>
                <WordLink word={ant} onClick={onWordClick} />
                {index < arr.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        </div>
      )}

      <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
        {definitionsToDisplay.map((def, index) => {
          let showExampleForThisItem = false;
          if (def.example && examplesShownCount < MAX_EXAMPLES_PER_PART_OF_SPEECH) {
            showExampleForThisItem = true;
            examplesShownCount++;
          }
          return (
            <DefinitionItem
              key={index}
              def={def}
              onWordClick={onWordClick}
              showExampleForThisDef={showExampleForThisItem}
            />
          );
        })}
      </ul>
    </div>
  );
};

interface EntryItemProps {
  entry: DefinitionEntry;
  onWordClick: (word: string) => void;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, onWordClick }) => {
  const audioPhonetic = entry.phonetics?.find(p => p.audio);

  return (
    <div className="mb-5 pb-3 border-b border-gray-200 last:border-b-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{entry.word}</h2>
      {entry.phonetic && <p className="text-base sm:text-lg text-blue-600 mb-2" aria-label="Phonetic spelling">{entry.phonetic}</p>}
      
      {audioPhonetic && audioPhonetic.audio && (
        <div className="flex items-center mb-3">
          <AudioPlayerButton audioUrl={audioPhonetic.audio} label={TRANSLATIONS.listenButton} />
        </div>
      )}

      {entry.origin && (
        <p className="text-gray-700 italic text-sm mb-3" aria-label="Word origin">
          {TRANSLATIONS.origin}: {entry.origin}
        </p>
      )}

      {entry.meanings.map((meaning, index) => (
        <MeaningItem key={`${meaning.partOfSpeech}-${index}`} meaning={meaning} onWordClick={onWordClick} />
      ))}
    </div>
  );
};

interface DefinitionDisplayProps {
  entries: DefinitionEntry[];
  onWordClick: (word: string) => void;
}

const DefinitionDisplay: React.FC<DefinitionDisplayProps> = ({ entries, onWordClick }) => {
  if (!entries || entries.length === 0) {
    return null; 
  }

  return (
    <div>
      {entries.map((entry, index) => (
        <EntryItem key={`${entry.word}-${index}`} entry={entry} onWordClick={onWordClick} />
      ))}
    </div>
  );
};

export default DefinitionDisplay;
