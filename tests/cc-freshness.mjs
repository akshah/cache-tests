
export default

{
  name: 'Cache-Control Freshness',
  id: 'cc-freshness',
  description: 'These tests check whether caches are conformant and optimal in calculating freshness using `Cache-Control`. See the [freshness section](https://httpwg.org/specs/rfc7234.html#expiration.model) of the HTTP caching specification, along with the specifics for [`Cache-Control`](https://httpwg.org/specs/rfc7234.html#header.cache-control).',
  tests: [
    {
      name: 'HTTP cache can reuse a response without explict freshness information or a validator (but doing that messes up the tests)',
      id: 'freshness-none',
      kind: 'optimal',
      requests: [
        {
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: max-age`',
      id: 'freshness-max-age',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with `Cache-Control: max-age=0`',
      id: 'freshness-max-age-0',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=0']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with `Cache-Control: max-age: 2147483648`',
      id: 'freshness-max-age-max',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2147483648']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with `Cache-Control: max-age: 99999999999`',
      id: 'freshness-max-age-max-plus',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=99999999999']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response when the `Age` header is greater than its `Cache-Control: max-age` freshness lifetime',
      id: 'freshness-max-age-age',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: max-age` and a past `Expires`',
      id: 'freshness-max-age-expires',
      depends_on: ['freshness-max-age'],
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Expires', -7200],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: max-age` and an invalid `Expires`',
      id: 'freshness-max-age-expires-invalid',
      depends_on: ['freshness-max-age'],
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Expires', '0'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with `Cache-Control: max-age=0` and a future `Expires`',
      id: 'freshness-max-age-0-expires',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Expires', 3600],
            ['Cache-Control', 'max-age=0'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: max-age` and a CC extension present',
      id: 'freshness-max-age-extension',
      kind: 'optimal',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'foobar, max-age=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: MaX-AgE`',
      id: 'freshness-max-age-case-insenstive',
      kind: 'optimal',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'MaX-aGe=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with negative `Cache-Control: max-age`',
      id: 'freshness-max-age-negative',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=-3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Private HTTP cache must not prefer `Cache-Control: s-maxage` over shorter `Cache-Control: max-age`',
      id: 'freshness-max-age-s-maxage-private',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600, max-age=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_only: true
    },
    {
      name: 'Private HTTP cache must not prefer `Cache-Control: s-maxage` over shorter `Cache-Control: max-age` (multiple headers)',
      id: 'freshness-max-age-s-maxage-private-multiple',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600'],
            ['Cache-Control', 'max-age=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_only: true
    },
    {
      name: 'An optimal shared HTTP cache reuses a response with positive `Cache-Control: s-maxage`',
      id: 'freshness-s-maxage-shared',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer `Cache-Control: s-maxage` over a longer `Cache-Control: max-age`',
      id: 'freshness-max-age-s-maxage-shared-longer',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600, s-maxage=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer `Cache-Control: s-maxage` over a longer `Cache-Control: max-age` (reversed)',
      id: 'freshness-max-age-s-maxage-shared-longer-reversed',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=1, max-age=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer `Cache-Control: s-maxage` over a longer `Cache-Control: max-age` (multiple headers)',
      id: 'freshness-max-age-s-maxage-shared-longer-multiple',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Cache-Control', 's-maxage=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'An optimal shared HTTP cache prefers `Cache-Control: s-maxage` over a shorter `Cache-Control: max-age`',
      id: 'freshness-max-age-s-maxage-shared-shorter',
      depends_on: ['freshness-s-maxage-shared'],
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, s-maxage=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ],
      browser_skip: true
    }
  ]
}
