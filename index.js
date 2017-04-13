/*!
 * trek-csrf
 * Copyright(c) 2017 Fangdun Cai <cfddream@gmail.com> (https://fundon.me)
 * MIT Licensed
 */

'use strict'

module.exports = csrfWithConfig

const Tokens = require('csrf')

const defaults = {
  key: 'csrf',
  tokenLookup: 'header:X-CSRF-Token',
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'TRACE'],
  // https://github.com/pillarjs/csrf#new-tokensoptions
  tokenOptions: undefined
}

function csrfWithConfig (options = {}) {
  options = Object.assign({}, defaults, options)

  const { key, tokenLookup, ignoreMethods, tokenOptions } = options

  const tokens = new Tokens(tokenOptions)

  const [via, field] = tokenLookup.split(':')

  let extractor = csrfTokenFromHeader

  switch (via) {
    case 'form':
      extractor = csrfTokenFromForm
      break
    case 'query':
      extractor = csrfTokenFromQuery
      break
    // No default
  }

  return csrf

  async function csrf ({ req, res, sessions, store }, next) {
    if (!sessions.secret) sessions.secret = await tokens.secret()

    if (!store.has(key)) store.set(key, tokens.create(sessions.secret))

    if (ignoreMethods.includes(req.method)) return next()

    const token = extractor(req, field)

    if (!token) return res.send(403, 'Invalid CSRF token')

    if (!tokens.verify(sessions.secret, token)) return res.send(403, 'Invalid CSRF token')

    return next()
  }
}

function csrfTokenFromHeader (req, header) {
  return req.get(header)
}

function csrfTokenFromForm (req, name) {
  return req.body && req.body[name]
}

function csrfTokenFromQuery (req, name) {
  return req.query[name]
}
