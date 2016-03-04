/*
 *	A topic bar for a room	
 */

<topic>
	<p>Topic: {topic}</p>


  <script>
    const mix = y.mixin('topic', (data) => {
      topic = data.topic
    })
    this.mixin(mix)
  </script>
</topic>