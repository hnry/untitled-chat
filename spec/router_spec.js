import lib from "../src/lib"

let y, router

describe("lib.router", () => {
  const console_reset = console.warn

  beforeEach(() => {
    y = lib()
    router = y.router
  })

  describe("warn", () => {
    afterEach(() => {
      console.warn = console_reset
    })

    it("only warns in debugging")

    it("tests condition to be true, returns result of condition", (done) => {
      console.warn = (...str) => {
        expect(str.join(" ")).toBe("hi test")
        done()
      }

      let result = y.warn(1 === 2, "doesn't warn")
      expect(result).toBe(false)

      const truthy = {}
      result = y.warn(truthy, "hi", "test")
      expect(result).toBe(true)
    })
  })

  describe("receive", () => {
    beforeEach(() => {
      console.warn = console_reset
      y = lib()
      router = y.router
    })

    it("warns if event[event] is missing", (done) => {
      console.warn = (str) => {
        expect(str.indexOf("Invalid event")).toBe(0)
        done()
      }
      router.receive({ x: 123 })
    })

    it("warns if no generic handlers for event", (done) => {
      console.warn = (str) => {
        expect(str.indexOf("Received event")).toBe(0)
        done()
      }
      router.receive({ event: 'test' })
    })

    it("warns if no view handlers found but expected there to be", (done) => {
      // "but still runs the route anyway"
      router._events = { test: 123 }

      let warning = false
      console.warn = (str) => {
        expect(str.indexOf("Expected event")).toBe(0)
        warning = true
      }

      router._run_route = (routes) => {
        expect(routes.length).toBe(1)
        expect(routes[0]).toBe(123)
        expect(warning).toBe(true)
        done()
      }

      router.receive({ event: 'test', network: 'test', name: 'test' })
    })

    it("constructs a route passing it to _run_route()", (done) => {
      let runs = 0
      router._run_route = (routes) => {
        runs += 1
        switch(runs) {
          case 1:
            expect(routes.length).toBe(1)
            expect(routes[0]).toBe(234)
            break
          case 2:
            expect(routes.length).toBe(2)
            expect(routes[0]).toBe(234)
            expect(routes[1]).toBe('test string')
            break
          case 3:
            expect(routes.length).toBe(4)
            expect(routes[0]).toBe(234)
            expect(routes[1]).toBe(123)
            expect(routes[2]).toBe(456)
            expect(routes[3]).toBe('test string')
            done()
        }
      }

      // runs 1
      router._events = { test: 234 }
      router.receive({ event: 'test' })

      // runs 2
      router._views = {
        testNét: {
          testname: {
            test: 'test string'
          }
        }
      }
      router.receive({ event: 'test', network: 'testNét', name: 'testname' })

      // runs 3
      router._viewHandlers = {
        test: [123, 456]
      }
      router.receive({ event: 'test', network: 'testNét', name: 'testname' })
    })
  })

  describe("send", () => {
    it("calls user defined send handler", (done) => {
      router.send_handler(function(a, b, c) {
        expect(a).toBe(123)
        expect(b).toBe('test')
        expect(c).toBe('blah')
        done()
      })

      router.send(123, 'test', 'blah')
    })
  })

  describe("_run_route", () => {
    it("executes a route sequentially passing along data", (done) => {
      const test_funs = [
        function(data, state, next) {
          data.count += 1
          next(data)
        },
        function(data, next) {
          expect(data).toEqual({ count: 1, z: 2 })
          data.count += 1
          data.x = 'new'
          next(data)
        },
        function(data, next) {
          expect(data).toEqual({ count: 2, z: 2, x: 'new' })
          next()
        },
        done
      ]
      router._run_route(test_funs, { count: 0, z: 2 })
    })

    it("supports async functions", (done) => {
      const test_funs = [
        function(data, state, next) {
          next()
        },
        function(data, next) {
          setTimeout(next, 10)
        },
        done
      ]
      router._run_route(test_funs, {})
    })

    it("first func in route is giving state access")
  })

  describe("set_event", () => {
    beforeEach(() => {
      console.warn = console_reset
    })

    it("warns with invalid arguments", (done) => {
      console.warn = (str) => {
        expect(str.indexOf('Error setting')).toBe(0)
        done()
      }
      router.set_event(123, () => {})
    })

    it("sets an event", () => {
      const fn = () => {}
      router.set_event('msg', fn)
      expect(router._events.msg).toBe(fn)
    })

    it("replaces an existing event", () => {
      const fn = () => {}
      router.set_event('msg', () => {})
      expect(router._events.msg).not.toBe(fn)
      router.set_event('msg', fn)
      expect(router._events.msg).toBe(fn)
    })
  })

})
