/**
 * Module dependencies.
 */
const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')
const appRoot = require('app-root-path')

/// Determine root configuration folder
const _configFilePathRelative = path.join(__dirname, '../config/')
const _configFilePathAppRoot = path.join(appRoot.path, '/config/')
const _configFilePath = fs.existsSync(_configFilePathRelative) ? _configFilePathRelative : _configFilePathAppRoot

/// include files that match this in their filename (including extension)
const _configSelectors = [ 'config.js', '.json' ]

/// Get all of the files in the configuration folder that match the selectors
const _configFiles = fs.readdirSync(_configFilePath).filter(filename => _configSelectors.reduce(s => filename.indexOf(s), false) )

/// clobber all of the files matching with 'config.js' in the filename together
const _config = _configFiles.reduce((out, configFilename) =>  merge(out, require(path.join(_configFilePath, configFilename))), { _configFilePath, _configFiles })

/// Return the clobfiguration
module.exports = _config
module.exports._configFilePath = _configFilePath
module.exports._configFiles = _configFiles
module.exports._configSelectors = _configSelectors
