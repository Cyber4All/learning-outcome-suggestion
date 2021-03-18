import { SearchResponse } from 'elasticsearch';
import { StandardOutcome } from '@cyber4all/clark-entity';
import {
  ResourceError,
  ResourceErrorReason,
  ServiceError,
  ServiceErrorReason,
} from './Errors';

const fetch = require('node-fetch');

const ELASTIC_SEARCH_URI = process.env.ELASTIC_SEARCH_URI;
const GUIDELINE_URI = `${ELASTIC_SEARCH_URI}/enguidelines/_search`;

/**
 * Default limit is set to 350 to allow a decent sized result set to be returned if client has not specified a limit
 * This number represents the total number of outcomes from the source with the most outcomes plus an added buffer range
 */
const DEFAULT_RESULT_SIZE = 350;

export interface ElasticSearchQuery { [queryKey: string]: any; }

export interface ElasticSearchPaginator {
  from: number;
  size: number;
}

/**
 * Queries guidelines within the ElasticSearch node
 *
 * @export
 * @param {ElasticSearchQuery} query [The query]
 * @returns {Promise<{
 *   total: number;
 *   outcomes: StandardOutcome[];
 * }>}
 */
export function queryGuidelines(
  query: ElasticSearchQuery,
): Promise<{
  total: number;
  outcomes: StandardOutcome[];
}> {
  return new Promise<{
    total: number;
    outcomes: StandardOutcome[];
  }>((resolve, reject) => {
    fetch(GUIDELINE_URI, {
      body: JSON.stringify(query),
      headers: {
        'Host': process.env.ELASTIC_SEARCH_HEADER,
        'Content-Type': 'application/json',
      },
      method: 'post'
    })
    .then(checkStatus)
    .then((json: any) => resolve(toPaginatedGuidelines(json)))
    .catch(transformRequestError)
    .catch((e: Error) => reject(e));
  });
}

/**
 * This checks the status of the response from the node-fetch
 * statement to see if it threw an error message
 * 
 * @param res The node-fetch response object
 * @returns The json of the request or throws and error
 */
function checkStatus(res: any): Promise<any> {
  // res.status >= 200 && res.status < 300
  if (res.ok) {
      return res.json();
  } else {
      throw res;
  }
}

/**
 *  Converts ElasticSearch SearchResponse to object with document totals and outcomes
 *
 * @private
 * @param {SearchResponse<Partial<StandardOutcome>>} results
 * @returns {{ total: number; outcomes: StandardOutcome[] }}
 */
function toPaginatedGuidelines(
  results: SearchResponse<Partial<StandardOutcome>>,
): { total: number; outcomes: StandardOutcome[] } {
  const total = results.hits.total;
  let outcomes: StandardOutcome[] = [];
  const guidelineHits = results.hits.hits;
  outcomes = guidelineHits.map(hit => {
    const outcome = hit._source;
    return new StandardOutcome({
      ...outcome,
      date: `${outcome.date}`,
    });
  });
  return { total, outcomes };
}

/**
 * Transforms errors from `request-promise` to service specific error types
 *
 * @private
 * @param {RequestError} e [The error object thrown]
 * @param {string} message [Custom error message]
 * @memberof HttpLearningObjectGateway
 */
function transformRequestError(e: any, message?: string) {
  if (e) {
    switch (e.status) {
      case 400:
        throw new ResourceError(
          message || 'Unable to load resource',
          ResourceErrorReason.BAD_REQUEST,
        );
      case 401:
        throw new ResourceError(
          message || 'Invalid access',
          ResourceErrorReason.INVALID_ACCESS,
        );
      case 404:
        throw new ResourceError(
          message || 'Unable to load resource',
          ResourceErrorReason.NOT_FOUND,
        );
      case 500:
        throw new ServiceError(ServiceErrorReason.INTERNAL);
      default:
        break;
    }
  }
  throw new ServiceError(ServiceErrorReason.INTERNAL);
}

/**
 * Builds pagination object which includes the size (Maximum amount of results to return or limit) and from (What section of results to return or page) properties
 * *** If no limit is defined, the default limit is used. ***
 * *** from (page) + size (limit) can not be more than the index.max_result_window index setting which defaults to 10,000. ***
 * *** https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-from-size.html ***
 *
 * @private
 * @param {number} limit [The maximum amount results to return]
 * @param {number} page [The page of results to return]
 * @returns {ElasticSearchPaginator}
 * @memberof ElasticSearchGateway
 */
export function buildPaginator({
  limit = DEFAULT_RESULT_SIZE,
  page,
}: {
  limit: number;
  page: number;
}): ElasticSearchPaginator {
  const paginator = { from: 0, size: 0 };
  paginator.size = limit;
  paginator.from = 0;
  if (page != null) {
    page = page <= 0 ? 1 : page;
    const skip = (page - 1) * limit;
    paginator.from = skip;
  }
  return paginator;
}
