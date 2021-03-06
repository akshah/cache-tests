import * as utils from '../utils.mjs'

var tests = []

var header = 'Test-Header'
var valueA = utils.httpContent(`${header}-value-A`)
var lm1 = utils.httpDate(Date.now(), -24 * 60 * 60)
tests.push({
  name: `HTTP cache must return stored \`${header}\` from a \`304\` that omits it`,
  id: `304-lm-use-stored-${header}`,
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'max-age=1'],
        ['Last-Modified', lm1],
        ['Date', 0],
        [header, valueA]
      ],
      setup: true,
      pause_after: true
    },
    {
      response_headers: [
        ['Cache-Control', 'max-age=3600'],
        ['Last-Modified', lm1],
        ['Date', 0]
      ],
      expected_type: 'lm_validated',
      expected_response_headers: [
        [header, valueA]
      ],
      setup_tests: ['expected_type']
    }
  ]
})

function check304 (args) {
  var header = args[0]
  var valueA = args[1] || utils.httpContent(`${header}-value-A`)
  var valueB = args[2] || utils.httpContent(`${header}-value-B`)
  var etag = utils.httpContent(`${header}-etag-1`)
  var etag1 = `"${etag}"`
  var lm1 = utils.httpDate(Date.now(), -24 * 60 * 60)

  tests.push({
    name: `HTTP cache must update returned \`${header}\` from a \`Last-Modified 304\``,
    id: `304-lm-update-response-${header}`,
    requests: [
      {
        response_headers: makeResponse(header, valueA, 'Last-Modified', lm1, 1),
        setup: true,
        pause_after: true
      },
      {
        response_headers: makeResponse(header, valueB, 'Last-Modified', lm1, 3600),
        expected_type: 'lm_validated',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update stored \`${header}\` from a \`Last-Modified 304\``,
    id: `304-lm-update-stored-${header}`,
    requests: [
      {
        response_headers: makeResponse(header, valueA, 'Last-Modified', lm1, 1),
        setup: true,
        pause_after: true
      },
      {
        response_headers: makeResponse(header, valueB, 'Last-Modified', lm1, 3600),
        expected_type: 'lm_validated',
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update returned \`${header}\` from a \`ETag 304\``,
    id: `304-etag-update-response-${header}`,
    requests: [
      {
        response_headers: makeResponse(header, valueA, 'ETag', etag1, 1),
        setup: true,
        pause_after: true
      },
      {
        response_headers: makeResponse(header, valueB, 'ETag', etag1, 3600),
        expected_type: 'etag_validated',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update stored \`${header}\` from a \`ETag 304\``,
    id: `304-etag-update-stored-${header}`,
    requests: [
      {
        response_headers: makeResponse(header, valueA, 'ETag', etag1, 1),
        setup: true,
        pause_after: true
      },
      {
        response_headers: makeResponse(header, valueB, 'ETag', etag1, 3600),
        setup: true,
        pause_after: true,
        expected_type: 'etag_validated'
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
}

function makeResponse (header, value, validatorType, validatorValue, lifetime) {
  return [
    ((header === 'Cache-Control') && ['a', 'b']) || ['Cache-Control', `max-age=${lifetime}`],
    ['Date', 0],
    [validatorType, validatorValue],
    [header, value]
  ]
}

[
  ['Test-Header'],
  ['X-Test-Header'],
  ['Content-Foo'],
  ['X-Content-Foo'],
  ['Content-Type', 'text/plain', 'text/plain;charset=utf-8'],
  ['Content-MD5', 'rL0Y20zC+Fzt72VPzMSk2A==', 'N7UdGUp1E+RbVvZSTy1R8g=='],
  ['Content-Location', '/foo', '/bar'],
  ['Content-Security-Policy', 'default-src \'self\'', 'default-src \'self\' cdn.example.com'],
  ['X-Frame-Options', 'deny', 'sameorigin'],
  ['X-XSS-Protection', '1', '1; mode=block'],
  ['Cache-Control', 'max-age=1', 'max-age=3600'],
  ['Expires', utils.httpDate(Date.now(), 1), utils.httpDate(Date.now(), 3600)],
  ['Clear-Site-Data', 'cache', 'cookies'],
  ['Public-Key-Pins'],
  ['Set-Cookie', 'a=b', 'a=c'],
  ['Set-Cookie2', 'a=b', 'a=c']
].forEach(check304)

export default {
  name: 'Update Headers Upon a 304',
  id: 'update304',
  description: 'These tests check cache behaviour upon recieving a `304 Not Modified` response. See the [relevant specification section](https://httpwg.org/specs/rfc7234.html#freshening.responses), and [this issue](https://github.com/httpwg/http-core/issues/165) for relevant discussion.',
  tests: tests
}
