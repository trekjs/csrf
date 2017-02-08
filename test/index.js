import test from 'ava'
import request from 'request-promise'
import Engine from 'trek-engine'
import sessions from 'trek-sessions'
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

  app.use(csrf())

  let obj = {}

  app.use(ctx => {
    obj = ctx.res.body = {
      secret: ctx.sessions.secret,
      token: ctx.store.get('csrf')
    }
  })

  const url = await listen(app)
  const res = await request({
    url,
    json: true,
    simple: false,
    resolveWithFullResponse: true
  })

  t.deepEqual(res.body, obj)
  t.is(res.statusCode, 200)
})
