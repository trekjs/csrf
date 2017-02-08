'use strict'

module.esports = makeCSRF

const Tokens = require('csrf')

const defaults = {
  key: 'csrf',
  name: '_csrf',
  maxAge: 86400,
  tokenLookup: 'header:X-CSRF-Token',
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'TRACE']
}

function makeCSRF (options = {}) {
  options = Object.assign({}, defaults, options)

  const { key, name, maxAge, tokenLookup, ignoreMethods } = options

  const [via, field] = tokenLookup.split(':')

  let extractor = csrfTokenFromHeader(field)

  switch (via) {
    case 'form':
      extractor = csrfTokenFromForm(field)
      break
    case 'query':
      extractor = csrfTokenFromQuery(field)
      break
    // no default
  }

  return csrf

  function csrf (ctx, next) {
    const token = extractor(ctx)

    if (ignoreMethods.includes(ctx.req.method)) return next()
  }
}

function csrfTokenFromHeader (header) {
  return getToken

  function getToken (ctx) {
    return ctx.req.get(header)
  }
}

function csrfTokenFromForm (name) {
  return getToken

  function getToken (ctx) {
    return ctx.req.body && ctx.req.body[name]
  }
}

function csrfTokenFromQuery (name) {
  return getToken

  function getToken (ctx) {
    return ctx.req.query[name]
  }
}
