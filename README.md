# clobfig
A configurator library

# getting started
clobfig looks for a config/ folder one folder up or in the root of the running application using appRoot. clobfig clobbers all of the files within the config folder found that have 'config.js' in their name and all .json files.

## usage
>/config/config.js:
```
module.exports = {
  yourValue: true
}
```

>/index.js:
```
const config = require('clobfig')

console.log(config.yourValue)
```
