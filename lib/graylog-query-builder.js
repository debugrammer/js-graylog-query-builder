const _ = require('lodash')

const EXISTS = '_exists_'

const COLON = ':'

const TO = 'TO'

const NOT = 'NOT'

const AND = 'AND'

const OR = 'OR'

const OPEN_PARENTHESIS = '('

const CLOSE_PARENTHESIS = ')'

const TILDE = '~'

const SPACE = ' '

/**
 * Graylog Query Builder
 *
 * See the Graylog documentation article on
 * [Searching](https://docs.graylog.org/en/latest/pages/queries.html).
 */
module.exports = class GraylogQuery {
  /**
   * @param {Array<string>} queries
   */
  constructor(queries) {
    /** @private {Array<string>} */
    this._queries = queries
  }

  /**
   * @param {GraylogQuery} query
   * @return {GraylogQuery}
   */
  static builder(query = null) {
    if (query === null) {
      return new GraylogQuery([])
    }

    return new GraylogQuery(query._queries)
  }

  /**
   * @param {GraylogQuery} query
   * @return {GraylogQuery}
   */
  append(query) {
    this._queries = _.concat(this._queries, query._queries)

    return this
  }

  /**
   * Messages that include the term or phrase.
   * @param {number|string} value term or phrase
   * @return {GraylogQuery} used to chain calls
   */
  term(value) {
    if (!value) {
      this._removeEndingConj()

      return this
    }

    if (_.isString(value)) {
      value = this._sanitize(value)
    }

    this._queries.push(value)

    return this
  }

  /**
   * Fuzziness with distance.
   * Messages that include similar term or phrase.
   * @param {string} value term or phrase
   * @param {number} distance Damerau-Levenshtein distance
   * @return {GraylogQuery} used to chain calls
   */
  fuzzTerm(value, distance = -1) {
    if (distance && !_.isNumber(distance)) {
      distance = -1
    }

    if (!value) {
      this._removeEndingConj()

      return this
    }

    this._queries.push(`${this._sanitize(value)}${TILDE}${distance}`)

    return this
  }

  /**
   * Messages that have the field.
   * @param {string} field field name
   * @return {GraylogQuery} used to chain calls
   */
  exists(field) {
    this._queries.push(`${EXISTS}${COLON}${field}`)

    return this
  }

  /**
   * Messages where the field includes the term or phrase.
   * @param {string} field field name
   * @param {number|string} value term or phrase
   * @return {GraylogQuery} used to chain calls
   */
  field(field, value) {
    if (!value) {
      this._removeEndingConj()

      return this
    }

    if (_.isString(value)) {
      value = this._sanitize(value)
    }

    this._queries.push(`${field}${COLON}${value}`)

    return this
  }

  /**
   * One side unbounded range query.
   * Messages where the field satisfies the condition.
   * @param {string} field field name
   * @param {string} operator range operator
   * @param {number} value number
   * @return {GraylogQuery} used to chain calls
   */
  opField(field, operator, value) {
    this._queries.push(`${field}${COLON}${operator}${value}`)

    return this
  }

  /**
   * Fuzziness with distance.
   * Messages where the field includes similar term or phrase.
   * @param {string} field field name
   * @param {string} value term or phrase
   * @param {number} distance Damerau-Levenshtein distance
   * @return {GraylogQuery} used to chain calls
   */
  fuzzField(field, value, distance = -1) {
    if (distance && !_.isNumber(distance)) {
      distance = -1
    }

    if (!value) {
      this._removeEndingConj()

      return this
    }

    this._queries.push(
      `${field}${COLON}${this._sanitize(value)}${TILDE}${distance}`
    )

    return this
  }

  /**
   * Range query.
   * Ranges in square brackets are inclusive, curly brackets are exclusive and can even be combined.
   * @param {string} field field name
   * @param {string} fromBracket from bracket
   * @param {number|string} from number/date
   * @param {number|string} to number/date
   * @param {string} toBracket to bracket
   * @return {GraylogQuery} used to chain calls
   */
  range(field, fromBracket, from, to, toBracket) {
    if (_.isString(from) && _.isString(to)) {
      from = `"${from}"`
      to = `"${to}"`
    }

    this._queries.push(
      `${field}${COLON}${fromBracket}${from}${SPACE}${TO}${SPACE}${to}${toBracket}`
    )

    return this
  }

  /**
   * Raw query.
   * @param {string} raw raw Graylog query
   * @return {GraylogQuery} used to chain calls
   */
  raw(raw) {
    this._queries.push(raw)

    return this
  }

  /**
   * NOT expression.
   * @return {GraylogQuery} used to chain calls
   */
  not() {
    this._queries.push(NOT)

    return this
  }

  /**
   * AND expression.
   * @return {GraylogQuery} used to chain calls
   */
  and() {
    this._queries.push(AND)

    return this
  }

  /**
   * OR expression.
   * @return {GraylogQuery} used to chain calls
   */
  or() {
    this._queries.push(OR)

    return this
  }

  /**
   * Open parenthesis.
   * @return {GraylogQuery} used to chain calls
   */
  openParen() {
    this._queries.push(OPEN_PARENTHESIS)

    return this
  }

  /**
   * Close parenthesis.
   * @return {GraylogQuery} used to chain calls
   */
  closeParen() {
    this._queries.push(CLOSE_PARENTHESIS)

    return this
  }

  /**
   * Completed Graylog query.
   * @return {string} completed Graylog query
   */
  build() {
    this._removeStartingConj()

    return _.join(this._queries, SPACE)
  }

  /**
   * Remove the conjunction at the end.
   * @private
   */
  _removeEndingConj() {
    if (_.isEmpty(this._queries)) {
      return
    }

    const conjunctions = [AND, OR, NOT]
    const lastQuery = this._queries[_.size(this._queries) - 1]

    if (_.indexOf(conjunctions, lastQuery) !== -1) {
      this._queries.pop()
    }
  }

  /**
   * Remove the starting conjunction.
   * @private
   */
  _removeStartingConj() {
    if (_.isEmpty(this._queries)) {
      return
    }

    const conjunctions = [AND, OR]
    const firstQuery = this._queries[0]

    if (_.indexOf(conjunctions, firstQuery) !== -1) {
      this._queries.shift()
    }

    if (_.size(this._queries) === 1 && firstQuery === NOT) {
      this._queries.shift()
    }
  }

  /**
   * Sanitize string value.
   * @param {string} value
   * @return {string}
   * @private
   */
  _sanitize(value) {
    if (!value) {
      return value
    }

    return `"${this._escape(value)}"`
  }

  /**
   * Escape input text as specified on Graylog docs.
   * @param {string} input
   * @return {string}
   * @private
   */
  _escape(input) {
    const metaCharacters = [
      '\\',
      '&',
      '|',
      ':',
      '/',
      '+',
      '-',
      '!',
      '(',
      ')',
      '{',
      '}',
      '[',
      ']',
      '^',
      '"',
      '~',
      '*',
      '?'
    ]

    _.forEach(metaCharacters, (meta) => {
      input = _.replace(input, meta, `\\${meta}`)
    })

    return input
  }
}
