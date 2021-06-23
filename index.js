const MD5_PARTITIONING_CACHE = {};

module.exports = {
  /**
   * Creates the values you'd compared to a MD5 hash to select partitioned
   * groups. Useful for sharding / bucketing / horizontally partitioning.
   * @example
   * // assert expected
   * const thresholds = createPartitionThresholds(4);
   * const expected = [
   *   [
   *     null,
   *     "40000000000000000000000000000000"
   *   ],
   *   [
   *     "40000000000000000000000000000000",
   *     "80000000000000000000000000000000"
   *   ],
   *   [
   *     "80000000000000000000000000000000",
   *     "C0000000000000000000000000000000"
   *   ],
   *   [
   *     "C0000000000000000000000000000000",
   *     "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
   *   ]
   * ];
   * require('assert').deepStrictEqual(thresholds, expected); // assert passes
   *
   * @example
   * // usage
   * const thresholds = createPartitionThresholds(4);
   *
   * for (const [min, max] of thresholds) {
   *   const query = `
   *     SELECT *
   *     FROM my_table
   *     WHERE my_md5_field <= ${max}
   *       ${min ? `AND my_md5_field > ${min}` : ''}
   *   `;
   *
   *   console.log(query);
   * }
   *
   * @param {number} groups
   * @param {boolean} cache If true, stores output in an object and returns the
   * value from the object if this function is called again with the same arguments.
   * @returns {[null|string, string][]}
   */
  createPartitionThresholds(groups = 16, cache = false) {
    if (cache && MD5_PARTITIONING_CACHE[groups]) return MD5_PARTITIONING_CACHE[groups];

    const base16MaxDigits = 32;
    const maxBase16 = Array(base16MaxDigits).fill('F').join('');
    const maxValue = parseInt(maxBase16, 16);

    const thresholds = [null];

    for (let i = 1; i <= groups; ++i) {
      const maxHash = i === groups
        ? maxBase16
        : padLeftWithZeroes((i * maxValue / groups).toString(16).toUpperCase(), base16MaxDigits);

      thresholds.push(maxHash);
    }

    const output = thresholds
      .slice(0, thresholds.length - 1)
      .map((threshold, index) => [threshold, thresholds[index + 1]]);

    if (cache) MD5_PARTITIONING_CACHE[groups] = output;
    return output;
  },
};


function padLeftWithZeroes(string, targetLength = 32) {
  if (string.length > targetLength) {
    throw new Error('padWithZeroes(): string too long');
  }
  const leftPadding = Array(targetLength - string.length).fill('0');
  return `${leftPadding}${string}`;
}
