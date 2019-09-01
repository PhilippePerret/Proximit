'use strict';

const Application = require('spectron').Application

let app = new Application({
  path: "./app.js"
})

app.start().then(function(){

})
.catch(function(error){
  console.error('Échec', error.message)
})
