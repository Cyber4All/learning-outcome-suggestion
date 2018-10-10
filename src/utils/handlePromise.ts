/**
 *  Handles Promise by returning data if successful.
 * If an error occurs it will throw the Error object provided and inject message.
 * If no Error object is provided, the error is returned
 *
 * @export
 * @template T
 * @param {Promise<T>} promise
 * @param {Error} [error]
 * @returns {Promise<T>}
 */
export function handlePromise<T>(
  promise: Promise<T>,
  error?: Error,
): Promise<T> {
  return promise.then<T>((data: T) => data).catch<T>(e => {
    if (error) {
      error.message =
        error.message &&
        error.message !== 'null' &&
        error.message !== 'undefined'
          ? error.message
          : e instanceof Error
            ? e.message
            : e;
      throw error;
    }
    return e;
  });
}
