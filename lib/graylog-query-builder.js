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
  constructor() {
    this._queries = []
  }

  static builder() {
    return new GraylogQuery()
  }

  term(value) {
    this._queries.push(value)

    return this
  }

  build() {
    return this._queries.join(SPACE)
  }
}
