/*
 *  = Events (Event Types) =
 *  There are 2 types...
 *  
 *  There are generic events that 
 *  match base on: { event: 'msg', ... }
 *
 *  There are specific events or named events that 
 *  match base on:
 *  { event: 'msg', network: 'net', name: 'a_name', ... }
 *
 *  Both event types can have additional keys, they are
 *  optional, and the router passes them along
 *
 *  The routing for events looks like this:
 *  on event { event: '...' } ->
 *    generic event handler { network: '...' } -> 
 *      view (named events) handlers ->
 *        view component { name: '...' }
 *
 *  They can be thought of as actions on a resource
 *  For example:
 *  on 'nick' -> /network
 *  on 'msg' -> /network/name
 *  on 'join' -> /network/name
 *
 *  = URL =
 *  Implement a classic observer / eventEmitter design
 *  They are generic and can be hooked into anywhere, 
 *  but can only be triggered through URL changes
 *
 *  They can be thought of as actions on *any* resource
 *  For example:
 *  on 'select-room' -> /
 *
 *  Just like file system paths, you can diverge into 
 *  any direction
 *
 *  = State =
 *  There is a concept of a state, but it has constraints
 *  purposelly added onto it.
 *
 *  Every event (the literal { event: '...' } ) has access
 *  to write to it's own state. But cannot write to any
 *  others.
 * 
 *  For example:
 *  "msg" can write to state[msg] but not to state[nick]
 *
 *  Read access is limited to within a routes "/network"
 */

let y = function() {

  let warn = () => {
    // be specific instead of a empty 
    // fn that returns undefined
    return false
  }
  const _DEBUG = typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production"

  if (_DEBUG) {
    warn = (cond, ...msg) => {
      if (typeof cond !== "boolean") {
        cond = !!cond
      }
      if (cond === true) {
        console.warn(...msg)
        return true
      }
      return false
    }
  }
 
  function store(state = {}, action) {
    switch(action.type) {
      case "":
        return state
      default:
        return state
    }
  }
  // state = {
  //  _$network: {
  //    nick: ...,
  //    rooms: ...,
  //    connected: ...
  //    _$name: {
  //      userlist: ...
  //    },
  //    $name: {
  //      ...
  //    }
  //  }
  // }
  const state = Redux.createStore(store)

  // event router (not a url router)
  const router = {

    _events: {}, // generic event handlers
    _views: {},  // registered view components
    _viewHandlers: {},

    /*
     *  entry point -> takes a event
     *    calls the generic event handler ->
     *    if possible, constructs a view handler route ->
     *      finds controller based on generic event
     *      finds view based on uid event
     */
    receive(payload) {
      const type = payload.event

      if (warn(!type, "Invalid event passed to router#receive")) {
        return
      }

      if (warn(!this._events[type], "Received event [", type, "] but no handlers found")) {
        return
      }

      const r = [] // construct route
      r.push(this._events[type])

      const group = payload.network
      const name = payload.name
      if (group && name) {
        // find view from _views
        let v
        if (this._views[group] && this._views[group][name] && this._views[group][name][type]) {
          v = this._views[group][name][type]
        } 

        if (!warn(!v, "Expected event ", type, " (", group, ", ", name, ") to have view, but none found -- If ok this is safe to ignore")) {
          if (this._viewHandlers[type]) {
            this._viewHandlers[type].forEach((fn) => {
              r.push(fn)
            })
          }
          r.push(v)
        }

      }

      this._run_route(r, payload)
    },

    /*
     * exit point, relay messages back to server
     * just a simple convienance wrapper for send_handler
     */
    send(...args) {
      this._send_handler(...args)
    },

    send_handler(fn) {
      this._send_handler = fn
    },

    _run_route(routes, payload) {
      let i = 0

      function next(data) {
        i += 1
        if (routes.length > i) {
          routes[i](payload, next)
        }
      }

      // TODO give state access...
      routes[i](payload, {}, next)
    },

    /*
     *  for setting or replacing generic events
     */
    set_event(event, fn) {
      if (warn(typeof event !== "string" || typeof fn !== "function", "Error setting event handler, expect (string, function) got (", typeof event, ",", typeof fn, ")")) {
        return
      }
      this._events[event] = fn
    }
  }

  const view = {
    /*
     *  register a view render component for 
     *  named events
     */
    register(named_event, fn) {
      const group = named_event.network
          , name = named_event.name
          , event = named_event.event

      if (warn(!group || !name || !event, "Registering a view requires a 'named' event")) {
        return
      }

      if (!router._views[group]) {
        router._views[group] = {}
      }

      if (!router._views[group][name]) {
        router._views[group][name] = {}
      }

      router._views[group][name][event] = fn
    },

    /*
     *  There can only be 1 function
     *  for a named event for a view
     */
    unregister(named_event) {
      const group = named_event.network
          , name = named_event.name
          , event = named_event.event
      
      if (warn(!group || !name || !event, "Unregistering a view requires a 'named' event")) {
        return
      }

      if (!warn(!router._views[group] || !router._views[group][name] || !router._views[group][name][event], "Expected to unregister view, but no view found")) {
        router._views[group][name][event] = null
      }     
    },

    /*
     *  takes (and applies to) generic events in either
     *  obj or string type
     *  but it is for the construction of view routes
     *  
     *  use this to set general processing for every view
     *  that matches this generic event
     */
    handlers(event_type, arr_funs) {
      // find the event type (the string)
      let type = ''
      if (typeof event_type === "string") {
        type = event_type
      } else if (typeof event_type === "object" && event_type.event) {
        type = event_type.event
      }

      if (warn(!type, "Call to handlers cannot find event type")) {
        return
      }

      // type check arr_funs is array
      if (warn(!Array.isArray(arr_funs), "Called handlers with invalid arguments")) {
        return
      }

      // type check array as functions
      if (_DEBUG) {
        const arr_check = arr_funs.every((fn) => {
          return typeof fn === "function"
        })

        if (warn(!arr_check, "Called handlers with invalid arguments")) {
          return
        }
      }

      router._viewHandlers[type] = arr_funs.slice(0)
    }
  }

  /*
   *  object literal generator for riot mixins
   */
  function mixin(event, fn) {
    return {
      init() {
        const sig = { event: event, network: this.opts.network, name: this.opts.name }

        this.on("before-mount", () => {
          view.register(sig, fn)
        })

        this.on("before-unmount", () => {
          view.unregister(sig, fn)
        })
      }
    }
  }

  return {
    warn,
    router,
    view,
    mixin
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = y
} else {
  y = y()
}
