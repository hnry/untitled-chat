/*
 *  = Events (Event Types) =
 *  There are 2 types...
 *  
 *  There are group events that 
 *  match base on: { event: 'msg', network: 'net', ... }
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

  function warn(str) {
    console.warn(str)
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

      if (!type) {
        warn("Invalid event passed to router#receive")
        return
      }
      if (!this._events[type]) {
        warn("Received event [" + type + "] but no handlers found")
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

        if (!v) {
          warn("Expected event " + type + " (" + group + ", " + name + ") to have view, but none found -- If ok this is safe to ignore")
        } else {
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
      if (typeof event !== "string" || typeof fn !== "function") {
        warn("Error setting event handler, expect (string, function) got (" + typeof event + ", " + typeof fn + ")") 
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
      routes.push({ event: uid_event, fn })
    },

    unregister(named_event) {

    },

    /*
     * set pre-render handlers for 
     * a generic event type
     *
     * to be called when route is triggered
     */
    handlers(event_type, arr_funs) {
      router._viewHandlers[event_type] = arr_funs
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
    router,
    view,
    controller,
    mixin
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = y
} else {
  y = y()
}
