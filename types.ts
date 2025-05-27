
export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: { name: string; url: string; };
}

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface License {
  name: string;
  url: string;
}

export interface DefinitionEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
  origin?: string;
}

export interface ApiErrorResponse { // For API's own error structure, e.g. 404
  title: string;
  message: string;
  resolution: string;
}

export type AppError = {
  title: string;
  message: string;
  severity?: 'error' | 'warning'; // Added severity
} | null;