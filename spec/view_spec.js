import lib from "../src/lib"

let y
  , router
  , view

const console_reset = console.warn

describe("lib.view", () => {

  beforeEach(() => {
    y = lib()
    router = y.router
    view = y.view
    console.warn = console_reset
  })

  describe("register", () => {
    it("registers a view to the router", () => {
      const fn = () => {}
      view.register(
          { network: "a", name: "b", event: "c" }
          , fn)

      expect(router._views.a.b.c).toBe(fn)
    })

    it("warns when invalid event type", (done) => {
      console.warn = (str) => {
        expect(str.indexOf("Registering a view")).toBe(0)
        done()
      }
      view.register({ network: "a", name: "b" })
    })
  })

  describe("unregister", () => {
    it("unregisters a view from the router", () => {
      router._views.a = {}
      router._views.a.b = {}
      router._views.a.b.c = () => {}
      view.unregister({ network: "a", name: "b", event: "c"})
      expect(router._views.a.b.c).toBe(null)
    })

    it("warns when invalid event type", (done) => {
      console.warn = (str) => {
        expect(str.indexOf("Unregistering a view")).toBe(0)
        done()
      }
      view.unregister({ network: "a", name: "b" })
    })

    it("warns if trying to unregister a view that was never registered", (done) => {
      console.warn = (str) => {
        expect(str.indexOf("Expected to unregister")).toBe(0)
        done()
      }
      view.unregister({ network: "a", name: "b", event: "e" })
    })
  })

  describe("handlers", () => {
    afterEach(() => {
      console.warn = console_reset
    })

    it("registers view handlers to the router", () => {
      const event = "msg"
      const fn = () => {}
      const fn2 = () => {}
      view.handlers({ event, other: "stuff" }, [fn, fn2])
      expect(router._viewHandlers[event].length).toBe(2)
      expect(router._viewHandlers[event][0]).toBe(fn)
      expect(router._viewHandlers[event][1]).toBe(fn2)
    })

    it("accepts a string as it's first argument", () => {
      const event = "msg"
      const fn = () => {}
      view.handlers("msg", [fn])
      expect(router._viewHandlers[event].length).toBe(1)
      expect(router._viewHandlers[event][0]).toBe(fn)
    })

    it("warns when called with invalid arguments types", (done) => {
      const event = "msg"
      let count = 0
      console.warn = (str) => {
        count += 1
        expect(str.indexOf("Called handlers with")).toBe(0)
        if (count === 2) {
          done()
        }
      }
      view.handlers(event, () => {})
      view.handlers(event, [() => {}, 'blah'])
    })

    it("warns when no possible event can be inferred", (done) => {
       console.warn = (str) => {
        expect(str.indexOf("Call to handlers cannot")).toBe(0)
        done()
      }
      view.handlers({x: 1, y: 2}, [() => {}])
    })

    it("does not keep reference to passed in array", () => {
      const event = "msg"
      const arr = [() => {}, () => {}]
      view.handlers(event, arr)
      expect(router._viewHandlers[event]).not.toBe(arr)
      expect(router._viewHandlers[event].length).toBe(2)
      arr.push(() => {})
      expect(arr.length).toBe(3)
      expect(router._viewHandlers[event].length).toBe(2)
    })
  })

})
