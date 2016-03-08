import lib from "../src/lib"

let y

/*
 *	Test funtions that integrate with redux
 */

describe("store -> reducer", () => {

	beforeEach(() => {
		y = lib()
	})

	it("writes ok for network events", () => {
		let state = y._reducer({}, { event: "hi", network: "test_group" })
		expect(state).toEqual({})

		y.router._events = {
			hi: (payload, state) => {
				return "write"
			}
		}

	 	state = y._reducer({}, { event: "hi", network: "test_group" })
	 	expect(state).toEqual({ test_group: {hi: "write" }})

	 	state = y._reducer(state, { event: "hi", network: "test_group2" })
	 	expect(state).toEqual({ test_group: {hi: "write" }, test_group2: { hi: "write" }})
	})

	it("writes ok for named events", () => {
		y.router._events = {
			hi: (payload, state) => {
				return "write"
			}
		}

		let state = y._reducer({}, { event: "hi", network: "test_group", name: "a_name" })

		expect(state).toEqual({
			test_group: {
				_$a_name: {
					hi: "write"
				}
			}
		})
	})

	it("receives a localized state relative to it's network", (done) => {
		const test_state = {
			group_hidden: {
				a: 1, b: 2, c: 3
			}
		}

		y.router._events = {
			hi: (payload, state) => {
				expect(state).toEqual(undefined)
				done()
			}
		}

		y._reducer(test_state, { event: "hi", network: "group", name: "a_name" })
	})

	it("returning undefined in a sub-reducer does not touch state", () => {
		y.router._events = {
			hi: (payload, state) => {}
		}

		const state = y._reducer({}, { event: "hi", network: "group", name: "a_name" })		
		expect(state).toEqual({
			group: {
				// the hi property is not initialized since an undefined was returned
				// initializing 'group' and 'a_name' is ok
				_$a_name: {}
			}
		})
	})

	it("manipulating passed in state does not affect new state", () => {
		const test_state = {
			group: {
				a: { b: 1 }
			}
		}

		y.router._events = {
			hi: (payload, state) => {
				state.a.b = 4
				return "write"
			}
		}

		const state = y._reducer(test_state, { event: "hi", network: "group", name: "a_name" })
		expect(test_state.group.a.b).toBe(1)
		expect(state).toEqual({
			group: {
				a: { b: 1 },
				_$a_name: {
					hi: "write"
				}
			}
		})
	})

})
