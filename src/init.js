riot.mount("#app", "app");


y.router.set_event("userlist", (in_data, state) => {
  // return writes whatever is returned to the 
  // "userlist" state
  return in_data.userlist

  // route continues as normal, giving registered view the new userlist
  // _NOT_ because of the new state being written, the new userlist
  // is inferred from in_data
  // 
  // the saved userlist in state is for other events that may need 
  // to read this data in their route, such as "join" or "part"
})

y.router.set_event("join", (in_data, state) => {
  // on new joins we need to "update" the userlist but the write to state
  // does not happen here
  const newlist = state.userlist
  newlist.push(in_data.nick) // do we have the specify a named event?

  // trigger "userlist" event so it writes to itself, because "join"
  // cannot write to "userlist" state
  y.router.receive({ event: "userlist", userlist: newlist, network: "", name: "" })

  // the router will continue along routes if a view registered for
  // a "join" event, but in this case, no views ever register
  // the route ends here
})

y.router.set_event("nick", (in_data, state, write_state) => {
  write_state(network, in_data.nick)
})

y.router.set_event("disconnect", (in_data, state, write_state) => {
  write_state(network, "disconnected")
})

y.router.set_event("rooms", (in_data, state, write_state) => {
  write_state(network, [in_data#rooms])
})

y.router.set_event("msg", (in_data, state, write_state) => {

})

y.controller("msg", [
  some_func,
  another_func,
  yet_another_func
]) // -> view_component()

websocket.on("receive", (data) => {
  // do some processing here
  const newdata = data
  y.router.receive(newdata) // -> matching event from set_event
})
