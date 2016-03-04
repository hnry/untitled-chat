/*
 *	Chat input, to send chat to server or run commands
 */

<chatinput>
	<input name='chat' type='text' onkeyup={ keyHandler } />


  <script type="text/javascript">
    this.keyHandler = function(e) {
/*
    if autocomplete
      y.sendRoute({ event: 'autocomplete', uid... })
    
    if enter
      y.send(signature, e.target.value)    
 */
    }
  </script>	
</chatinput>