<chatlines>
  <div name='chat'></div>


  <script>
    const mix = y.mixin('msg', (data) => {
      const line = document.createElement('div')
      line.innerHTML = data.text
      this.chat.appendChild(line)
    })
    this.mixin(mix)
  </script>
</chatlines>