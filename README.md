# clobfig
A configurator library

# getting started
clobfig looks for a config/ folder one folder up or in the root of the running application using appRoot. clobfig clobbers all of the files within the config folder found that have 'config.js' in their name and all .json files. The json files are loaded first and are loaded as [name].json  (ex: pages.json => clobfig.pages). Note: all json files are loaded this way with the exception of config.json

## usage
>/config/config.json:
```
{
  "value1": "one"
}
```

>/config/config.js:
```
module.exports = {
  version: "@version"
}
```

>/config/data.json:
```
{
  "somedata": "somevalue"
}
```

>/package.json:
```
{
  "version": "0.1.0"
}
```

>/index.js:
```
const config = require('clobfig')()

console.log(config)
```

The code example above will output:
```
{
  version: "0.1.0",
  data: {
    somedata: "somevalue"
  },
  value1: "one"
}
```