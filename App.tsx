
import React, { useState, useEffect, useCallback } from 'react';
// Removed: import { GoogleGenAI } from "@google/genai";
import { DefinitionEntry, AppError, ApiErrorResponse, Phonetic, Meaning, Definition as DefType } from './types';
import { TRANSLATIONS, RANDOM_ENGLISH_WORDS } from './constants';
import DefinitionDisplay from './components/DefinitionDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const MAX_DEFINITIONS_PER_PART_OF_SPEECH = 3;
const MAX_SYNONYMS_ANTONYMS_TO_SHOW = 4; // Max S/A to display per part of speech

// Removed Gemini AI client initialization block

const App: React.FC = () => {
  const [wordInput, setWordInput] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentWord, setCurrentWord] = useState<string>('');
  const [definitionData, setDefinitionData] = useState<DefinitionEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError>(null);

  useEffect(() => {
    document.title = TRANSLATIONS.pageTitle;
  }, []);

  const fetchDefinition = useCallback(async (wordToFetch: string) => {
    const trimmedWord = wordToFetch.trim();
    if (!trimmedWord) {
      setError({ title: TRANSLATIONS.enterWordTitle, message: TRANSLATIONS.enterWord, severity: 'warning' });
      setDefinitionData(null);
      setIsLoading(false);
      setWordInput(''); 
      return;
    }

    setIsLoading(true);
    setError(null);
    setDefinitionData(null);
    setCurrentWord(trimmedWord);

    try {
      const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${trimmedWord}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          setError({ title: TRANSLATIONS.wordNotFoundTitle, message: TRANSLATIONS.wordNotFound(trimmedWord), severity: 'error' });
        } else {
          setError({ title: TRANSLATIONS.apiErrorTitle(response.status), message: TRANSLATIONS.apiError(response.status), severity: 'error' });
        }
        setDefinitionData(null);
        setIsLoading(false);
        return;
      }
      
      const data: DefinitionEntry[] | ApiErrorResponse = await response.json();

      if (!Array.isArray(data)) { 
        const errorResponse = data as ApiErrorResponse;
        if (errorResponse.title && errorResponse.title === "No Definitions Found") {
            setError({ title: TRANSLATIONS.wordNotFoundTitle, message: TRANSLATIONS.wordNotFound(trimmedWord), severity: 'error' });
        } else { 
            setError({ title: TRANSLATIONS.noDefinitionFoundTitle, message: TRANSLATIONS.noDefinitionFound(trimmedWord), severity: 'error' });
        }
        setDefinitionData(null);
        setIsLoading(false);
        return;
      }
      
      if (data.length === 0) {
        setError({ title: TRANSLATIONS.noDefinitionFoundTitle, message: TRANSLATIONS.noDefinitionFound(trimmedWord), severity: 'error' });
        setDefinitionData(null);
      } else {
        const wordToDisplay = data[0].word; 
        const combinedEntry: DefinitionEntry = {
            word: wordToDisplay,
            phonetic: data.map(e => e.phonetic).find(p => p) || '',
            phonetics: data.reduce((acc, entry) => acc.concat(entry.phonetics || []), [] as Phonetic[])
                           .filter((ph, index, self) => 
                               index === self.findIndex(p => p.text === ph.text && p.audio === ph.audio)),
            origin: data.map(e => e.origin).find(o => o) || undefined,
            meanings: [],
            license: data[0].license || { name: '', url: '' },
            sourceUrls: data[0].sourceUrls || [],
        };

        const meaningsMap = new Map<string, Meaning>();
        data.forEach(entry => {
            (entry.meanings || []).forEach(m => {
                let existingMeaning = meaningsMap.get(m.partOfSpeech);
                if (!existingMeaning) {
                    existingMeaning = {
                        partOfSpeech: m.partOfSpeech,
                        definitions: [],
                        synonyms: [],
                        antonyms: [],
                    };
                    meaningsMap.set(m.partOfSpeech, existingMeaning);
                }

                (m.definitions || []).forEach(newDef => {
                    const existingDefIndex = existingMeaning!.definitions.findIndex(d => d.definition === newDef.definition);
                    if (existingDefIndex > -1) {
                        const defToUpdate = existingMeaning!.definitions[existingDefIndex];
                        if (newDef.synonyms) defToUpdate.synonyms = [...new Set([...defToUpdate.synonyms, ...newDef.synonyms])];
                        if (newDef.antonyms) defToUpdate.antonyms = [...new Set([...defToUpdate.antonyms, ...newDef.antonyms])];
                        if (!defToUpdate.example && newDef.example) defToUpdate.example = newDef.example;
                    } else {
                        existingMeaning!.definitions.push({
                            ...newDef,
                            synonyms: newDef.synonyms ? [...new Set(newDef.synonyms)] : [],
                            antonyms: newDef.antonyms ? [...new Set(newDef.antonyms)] : [],
                        });
                    }
                });
                
                if (m.synonyms) existingMeaning.synonyms.push(...m.synonyms);
                if (m.antonyms) existingMeaning.antonyms.push(...m.antonyms);
            });
        });
        
        // Consolidate synonyms/antonyms at part of speech level from dictionary API
        meaningsMap.forEach(meaning => {
            meaning.synonyms = meaning.synonyms ? [...new Set(meaning.synonyms)] : [];
            meaning.antonyms = meaning.antonyms ? [...new Set(meaning.antonyms)] : [];
        });

        // Removed Gemini API supplementation logic block
        
        // Final processing for each meaning
        meaningsMap.forEach(meaning => {
            meaning.synonyms = meaning.synonyms.slice(0, MAX_SYNONYMS_ANTONYMS_TO_SHOW);
            meaning.antonyms = meaning.antonyms.slice(0, MAX_SYNONYMS_ANTONYMS_TO_SHOW);
            meaning.definitions = meaning.definitions.slice(0, MAX_DEFINITIONS_PER_PART_OF_SPEECH);
        });
        
        combinedEntry.meanings = Array.from(meaningsMap.values());
        setDefinitionData([combinedEntry]);
        setError(null);
      }
    } catch (err) {
      console.error('Network or other error fetching definition:', err);
      setError({ title: TRANSLATIONS.networkErrorTitle, message: TRANSLATIONS.networkError, severity: 'error' });
      setDefinitionData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchDefinition(wordInput);
  };

  const handleLuckySearch = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_ENGLISH_WORDS.length);
    const randomWord = RANDOM_ENGLISH_WORDS[randomIndex];
    setWordInput(randomWord);
    fetchDefinition(randomWord);
  };

  const handleWordInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWordInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSynonymAntonymClick = (clickedWord: string) => {
    setWordInput(clickedWord);
    fetchDefinition(clickedWord);
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
        {TRANSLATIONS.mainTitle}
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={wordInput}
          onChange={handleWordInputChange}
          onKeyPress={handleKeyPress}
          placeholder={TRANSLATIONS.wordInputPlaceholder}
          className="flex-grow p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-base placeholder:text-gray-300"
          aria-label="Enter word to search"
          aria-invalid={!!error}
          aria-describedby={error ? "error-message" : undefined}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-5 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {TRANSLATIONS.searchButton}
        </button>
        <button
          onClick={handleLuckySearch}
          disabled={isLoading}
          className="px-5 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Search a random word"
        >
          {TRANSLATIONS.luckyButton}
        </button>
      </div>

      <div 
        id="definitionOutput" 
        className="bg-gray-50 p-5 rounded-md border border-gray-200 min-h-[200px] definition-scroll overflow-y-auto"
        aria-live="polite"
        role="region"
      >
        {isLoading && <LoadingSpinner message={TRANSLATIONS.loadingIndicator} />}
        {!isLoading && error && (
          <div 
            id="error-message"
            className={`text-center ${error.severity === 'warning' ? 'text-yellow-600' : 'text-red-500'}`}
            role="alert"
          >
            <p className="font-semibold text-lg mb-1">{error.title}</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
        {!isLoading && !error && !definitionData && (
          <p className="text-gray-600 text-center text-base">{TRANSLATIONS.initialMessage}</p>
        )}
        {!isLoading && !error && definitionData && (
          <DefinitionDisplay entries={definitionData} onWordClick={handleSynonymAntonymClick} />
        )}
      </div>
      <footer className="text-center text-sm text-gray-600 mt-8 py-4">
        Created by <a href="https://www.goat.africa" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Carlos Araújo</a>
      </footer>
    </div>
  );
};

export default App;
