const test = require('ava')
const GraylogQuery = require('../lib/graylog-query-builder')

test('TC_001_INIT', (t) => {
  const query = GraylogQuery.builder()

  const expect = ``

  t.is(expect, query.build())
})

test('TC_002_TERM', (t) => {
  const query = GraylogQuery.builder().term('ssh')

  const expect = `"ssh"`

  t.is(expect, query.build())
})

test('TC_003_FUZZ_TERM', (t) => {
  const query = GraylogQuery.builder().fuzzTerm('ssh')

  const expect = `"ssh"~`

  t.is(expect, query.build())
})

test('TC_004_FUZZ_TERM_WITH_DISTANCE', (t) => {
  const query = GraylogQuery.builder().fuzzTerm('ssh', 3)

  const expect = `"ssh"~3`

  t.is(expect, query.build())
})

test('TC_005_EXISTS', (t) => {
  const query = GraylogQuery.builder().exists('type')

  const expect = `_exists_:type`

  t.is(expect, query.build())
})

test('TC_006_FIELD', (t) => {
  const query = GraylogQuery.builder().field('type', 'ssh')

  const expect = `type:"ssh"`

  t.is(expect, query.build())
})

test('TC_007_NUMERIC_FIELD', (t) => {
  const query = GraylogQuery.builder().field('http_response_code', 500)

  const expect = `http_response_code:500`

  t.is(expect, query.build())
})

test('TC_008_RANGE_FIELD', (t) => {
  const query = GraylogQuery.builder().opField('http_response_code', '>', 500)

  const expect = `http_response_code:>500`

  t.is(expect, query.build())
})

test('TC_011_RANGE', (t) => {
  const query = GraylogQuery.builder().range(
    'http_response_code',
    '[',
    500,
    504,
    '}'
  )

  const expect = `http_response_code:[500 TO 504}`

  t.is(expect, query.build())
})

test('TC_012_DATE_RANGE', (t) => {
  const query = GraylogQuery.builder().range(
    'timestamp',
    '{',
    '2019-07-23 09:53:08.175',
    '2019-07-23 09:53:08.575',
    ']'
  )

  const expect = `timestamp:{"2019-07-23 09:53:08.175" TO "2019-07-23 09:53:08.575"]`

  t.is(expect, query.build())
})

test('TC_013_RAW', (t) => {
  const query = GraylogQuery.builder().raw('/ethernet[0-9]+/')

  const expect = `/ethernet[0-9]+/`

  t.is(expect, query.build())
})
