import lib from "../src/lib"

let y
const console_reset = console.warn

describe("lib - misc", () => {

  beforeEach(() => {
    y = lib()
    console.warn = console_reset
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

  describe("mixin (riotjs)", () => {
    it("enables view register and unregister for riotjs mount events", (done) => {
      const fn = () => {}
      const expected_event = { network: "a", name: "b", event: "c"}


      const mix = y.mixin(expected_event.event, fn)

      expect(Object.keys(mix)).toEqual(["init"])

      let calls = 0

      const mock = {
        opts: { network: expected_event.network, name: expected_event.name },
        
        on(ev, fn) {
          calls += 1
          // mount
          if (calls === 1) {
            fn()
            expect(y.view.register).toHaveBeenCalled()
            expect(y.view.register.calls.first().args.length).toBe(2)
            expect(y.view.register.calls.first().args[0]).toEqual(expected_event)
            expect(typeof y.view.register.calls.first().args[1]).toBe("function")

          // unmount
          } else if (calls === 2) {
            fn()
            expect(y.view.unregister).toHaveBeenCalled()
            expect(y.view.unregister.calls.first().args.length).toBe(1)
            expect(y.view.unregister.calls.first().args[0]).toEqual(expected_event)
            done()
          }
        }
      }

      y.view.register = jasmine.createSpy("mount")  
      y.view.unregister = jasmine.createSpy("unmount")  
      mix.init.call(mock)
    })

    /*
     *  Given a riotjs component, it will search
     *  this[view.prop_name].name and this.name
     */
    it("searches for named event information from prop_name as well as the component")

    it("provides a _helpful_ warning when the mixin cannot infer a named event")

    it("warns on type mismatch, expects (str, fn)")
  })

})
