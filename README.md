# trek-csrf

CSRF Tokens Middleware for Trek.js


## Installation

```
$ npm install trek-csrf --save
```


## Examples

```js
'use strict'

const Engine = require('trek-engine')
const sessions = require('trek-sessions')
const bodyParser = require('trek-body-parser')
const csrf = require('trek-csrf')

async function start () {
  const app = new Engine()

  app.use(sessions())

  app.use(bodyParser())

  app.use(csrf())

  app.use(ctx => {
    ctx.res.body = ctx.store.get('csrf')
  })

  app.on('error', (err, ctx) => {
    console.log(err)
  })

  app.run(3000)
}

start().catch(console.log)
```


## API

```js
csrf({
  key: 'csrf',
  tokenLookup: 'header:X-CSRF-Token',
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'TRACE'],
  // https://github.com/pillarjs/csrf#new-tokensoptions
  tokenOptions: undefined
})
```


## Badges

[![Build Status](https://travis-ci.org/trekjs/csrf.svg?branch=master)](https://travis-ci.org/trekjs/csrf)
[![codecov](https://codecov.io/gh/trekjs/csrf/branch/master/graph/badge.svg)](https://codecov.io/gh/trekjs/csrf)
![](https://img.shields.io/badge/license-MIT-blue.svg)

---

> [fundon.me](https://fundon.me) &nbsp;&middot;&nbsp;
> GitHub [@fundon](https://github.com/fundon) &nbsp;&middot;&nbsp;
> Twitter [@_fundon](https://twitter.com/_fundon)
