riot.mount("#app", "app");



y.router.set_event("userlist", (in_data, state, write_state) => {
  write_state(uid, [in_data#userlist])
})

y.router.set_event("join", () => {
  // read "userlist" data
  // trigger "userlist" event so it writes to itself
  // optionally pass the "join" event down to view if someone
  // registered for this event in the view
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
