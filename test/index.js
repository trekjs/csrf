import test from 'ava'
import request from 'request-promise'
import Engine from 'trek-engine'
import sessions from 'trek-sessions'
import bodyParser from 'trek-body-parser'
import csrf from '..'

const listen = app => {
  return new Promise((resolve, reject) => {
    app.run(function (err) {
      if (err) {
        return reject(err)
      }
      const { port } = this.address()
      resolve(`http://localhost:${port}`)
    })
  })
}

test('should get secret and token', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use(bodyParser())

  app.use(csrf())

  let obj = {}

  app.use(ctx => {
    obj = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
    ctx.res.body = obj
  })

  const url = await listen(app)
  const r = request.defaults({ jar: true })
  const res = await r({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)

  const res2 = await r({
    url,
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    headers: {
      'X-CSRF-Token': obj.token
    }
  })

  t.deepEqual(res2.body.secret, obj.secret)
  t.deepEqual(res2.body.token, obj.token)
  t.is(res2.statusCode, 200)
})

test('should get token from form', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  const multipart = bodyParser.multipart()
  app.use(multipart.single('avatar'))

  app.use(csrf({
    tokenLookup: 'form:csrfToken'
  }))

  let obj = {}

  app.use(ctx => {
    obj = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
    ctx.res.body = obj
  })

  const url = await listen(app)
  const r = request.defaults({ jar: true })
  const res = await r({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)

  const res2 = await r({
    url,
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    formData: {
      csrfToken: obj.token
    }
  })

  t.deepEqual(res2.body.secret, obj.secret)
  t.deepEqual(res2.body.token, obj.token)
  t.is(res2.statusCode, 200)
})

test('should get token from query', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use(bodyParser())

  app.use(csrf({
    tokenLookup: 'query:csrf'
  }))

  let obj = {}

  app.use(ctx => {
    obj = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
    ctx.res.body = obj
  })

  const url = await listen(app)
  const r = request.defaults({ jar: true })
  const res = await r({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)

  const res2 = await r({
    url,
    qs: {
      csrf: obj.token
    },
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res2.body.secret, obj.secret)
  t.deepEqual(res2.body.token, obj.token)
  t.is(res2.statusCode, 200)
})

test('should return 403 when missing token', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use(bodyParser({
    urlencoded: true
  }))

  app.use(csrf({
    tokenLookup: 'form:csrfToken'
  }))

  let obj = {}

  app.use(ctx => {
    obj = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
    ctx.res.body = obj
  })

  const url = await listen(app)
  const r = request.defaults({ jar: true })
  const res = await r({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)

  const res2 = await r({
    url,
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    form: {
      csrfToken: ''
    }
  })

  t.is(res2.statusCode, 403)
})

test('should return 403 when invalid token', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use(bodyParser({
    urlencoded: true
  }))

  app.use(csrf({
    tokenLookup: 'form:csrfToken'
  }))

  let obj = {}

  app.use(ctx => {
    obj = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
    ctx.res.body = obj
  })

  const url = await listen(app)
  const r = request.defaults({ jar: true })
  const res = await r({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)

  const res2 = await r({
    url,
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    form: {
      csrfToken: '233'
    }
  })

  t.is(res2.statusCode, 403)
  t.is(res2.body, 'Invalid CSRF token')
})
