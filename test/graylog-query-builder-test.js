import test from 'ava'
import GraylogQuery from '../lib/graylog-query-builder'

test('TC_001_INIT', (t) => {
  const query = GraylogQuery.builder()

  const expect = ''

  t.is(expect, query.build())
})

test('TC_002_TERM', (t) => {
  const query = GraylogQuery.builder()
    .term('ssh')

  const expect = '"ssh"'

  t.is(expect, query.build())
})
