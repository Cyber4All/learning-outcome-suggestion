import { DataStore, Responder } from '../interfaces/interfaces';
import { suggestMode, OutcomeFilter } from '../interfaces/DataStore';
import * as spellcheck from 'spellchecker';
import * as stopword from 'stopword';
import * as stemmer from 'stemmer';
import { StandardOutcomeDocument } from '@cyber4all/clark-schema';
import { ClientError, GENERIC_REASON } from '../types';

export class SuggestionInteractor {
  /**
   * Suggests Outcomes
   *
   * @static
   * @param {DataStore} dataStore
   * @param {Responder} responder
   * @param {OutcomeFilter} filter
   * @param {suggestMode} [mode='text']
   * @param {number} [threshold=0]
   * @param {number} [limit]
   * @param {number} [page]
   * @returns {Promise<void>}
   * @memberof SuggestionInteractor
   */
  public static async suggestOutcomes(
    dataStore: DataStore,
    filter: OutcomeFilter,
    mode: suggestMode = 'text',
    threshold: number = 0,
    limit?: number,
    page?: number,
  ): Promise<{ total: number; outcomes: StandardOutcomeDocument[] }> {
    try {
      filter = this.sanitizeFilter(filter);
      filter.text = this.removeStopwords(filter.text);
      filter.text = this.stemWords(filter.text);
      return await dataStore.suggestOutcomes(
        filter,
        mode,
        threshold,
        limit,
        page,
      );
    } catch (e) {
      console.error(e);
      const clientErr: ClientError = {
        message: `Could not suggest outcomes.`,
        error: e,
        status: e.reason ? e.reason : GENERIC_REASON.UNEXPECTED_ERROR,
      };
      return Promise.reject(clientErr);
    }
  }
  /**
   * Searches Outcomes
   *
   * @static
   * @param {DataStore} dataStore
   * @param {Responder} responder
   * @param {OutcomeFilter} filter
   * @param {number} [limit]
   * @param {number} [page]
   * @returns {Promise<void>}
   * @memberof SuggestionInteractor
   */
  public static async searchOutcomes(
    dataStore: DataStore,
    filter: OutcomeFilter,
    limit?: number,
    page?: number,
  ): Promise<{ total: number; outcomes: StandardOutcomeDocument[] }> {
    try {
      filter = this.sanitizeFilter(filter);
      return await dataStore.searchOutcomes(filter, limit, page);
    } catch (e) {
      console.error(e);
      const clientErr: ClientError = {
        message: `Could not search outcomes.`,
        error: e,
        status: e.reason ? e.reason : GENERIC_REASON.UNEXPECTED_ERROR,
      };
      return Promise.reject(clientErr);
    }
  }

  /**
   * Fetches all Standard Outcome sources
   *
   * @static
   * @param {DataStore} dataStore
   * @returns {Promise<string[]>}
   * @memberof SuggestionInteractor
   */
  public static async fetchSources(dataStore: DataStore): Promise<string[]> {
    try {
      return await dataStore.fetchSources();
    } catch (e) {
      console.error(e);
      const clientErr: ClientError = {
        message: `Could not fetch sources.`,
        error: e,
        status: e.reason ? e.reason : GENERIC_REASON.UNEXPECTED_ERROR,
      };
      return Promise.reject(clientErr);
    }
  }

  /**
   * Removes undefined properties in Outcome Filter
   *
   * @private
   * @static
   * @param {OutcomeFilter} filter
   * @returns {OutcomeFilter}
   * @memberof SuggestionInteractor
   */
  private static sanitizeFilter(filter: OutcomeFilter): OutcomeFilter {
    for (const prop in filter) {
      if (!filter[prop]) {
        delete filter[prop];
      }
    }
    if (filter.text) {
      filter.text = filter.text.trim();
      filter.text = this.correctSpellings(filter.text);
    } else {
      filter.text = '';
    }
    return filter;
  }
  /**
   * Replaces misspelled word with highest weighted stemmed correction
   *
   * @private
   * @static
   * @param {string} text
   * @returns {string}
   * @memberof SuggestionInteractor
   */
  private static correctSpellings(text: string): string {
    let fixedTxt = text;
    const corrections = spellcheck.checkSpelling(text);
    for (const pos of corrections) {
      const old = text.substring(pos.start, pos.end);
      const possibleCorrections = spellcheck.getCorrectionsForMisspelling(old);
      let fixed = this.getHighestWeightedCorrection(possibleCorrections);
      fixedTxt = fixedTxt.replace(old, fixed);
    }
    return fixedTxt;
  }
  /**
   * Gets stem of each correction and assigns weights based on frequency of stem.
   *
   * @private
   * @static
   * @param {string[]} possible
   * @returns {string}
   * @memberof SuggestionInteractor
   */
  private static getHighestWeightedCorrection(possible: string[]): string {
    const scores: Map<string, number> = new Map<string, number>();
    for (const word of possible) {
      const stem = this.stemWords(word);
      if (scores.has(stem)) {
        let oldScore = scores.get(stem);
        scores.set(stem, ++oldScore);
      } else {
        scores.set(stem, 1);
      }
    }
    const correction = { word: '', score: 0 };
    scores.forEach((score, word) => {
      if (score > correction.score) {
        correction.score = score;
        correction.word = word;
      }
    });
    return correction.word;
  }
  /**
   * Returns stems for words in a string
   *
   * @private
   * @static
   * @param {string} text
   * @returns {string}
   * @memberof SuggestionInteractor
   */
  private static stemWords(text: string): string {
    text = text
      .split(' ')
      .map(word => stemmer(word))
      .join(' ')
      .trim();
    return text;
  }

  /**
   * Returns string without stopwords
   *
   * @private
   * @static
   * @param {string} text
   * @returns {string}
   * @memberof SuggestionInteractor
   */
  private static removeStopwords(text: string): string {
    const oldString = text.split(' ');
    text = stopword
      .removeStopwords(oldString)
      .join(' ')
      .trim();
    return text;
  }
}
