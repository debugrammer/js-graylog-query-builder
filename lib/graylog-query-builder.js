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

module.exports = class GraylogQuery {
  constructor(queries) {
    this._queries = queries
  }

  static builder(query = null) {
    if (query === null) {
      return new GraylogQuery([])
    }

    return new GraylogQuery(query._queries)
  }

  append(query) {
    this._queries = _.concat(this._queries, query._queries)

    return this
  }

  term(value) {
    if (!value) {
      return this
    }

    if (_.isString(value)) {
      value = this._sanitize(value)
    }

    this._queries.push(value)

    return this
  }

  fuzzTerm(value, distance = '') {
    if (distance && !_.isNumber(distance)) {
      distance = ''
    }

    if (!value) {
      return this
    }

    this._queries.push(`${this._sanitize(value)}${TILDE}${distance}`)

    return this
  }

  exists(field) {
    this._queries.push(`${EXISTS}${COLON}${field}`)

    return this
  }

  field(field, value) {
    if (!value) {
      return this
    }

    if (_.isString(value)) {
      value = this._sanitize(value)
    }

    this._queries.push(`${field}${COLON}${value}`)

    return this
  }

  opField(field, operator, value) {
    this._queries.push(`${field}${COLON}${operator}${value}`)

    return this
  }

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

  raw(raw) {
    this._queries.push(raw)

    return this
  }

  not() {
    this._queries.push(NOT)

    return this
  }

  and() {
    this._queries.push(AND)

    return this
  }

  or() {
    this._queries.push(OR)

    return this
  }

  openParen() {
    this._queries.push(OPEN_PARENTHESIS)

    return this
  }

  closeParen() {
    this._queries.push(CLOSE_PARENTHESIS)

    return this
  }

  build() {
    return _.join(this._queries, SPACE)
  }

  _sanitize(value) {
    if (!value) {
      return
    }

    return `"${this._escape(value)}"`
  }

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
