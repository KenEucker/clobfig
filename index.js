/**
 * Module dependencies.
 */
const path = require('path')
const merge = require('merge')
const appRoot = require('app-root-path')

/// Determine root configuration folder
const _configFilePathRelative = path.join(__dirname, '../config/')
const _configFilePathAppRoot = path.join(appRoot, '/config/')
const _configFilePath = fs.fileExistsSync(_configFilePathRelative) ? _configFilePathRelative : _configFilePathAppRoot

/// Get all of the files in the configuration folder
const _configFiles = csvMod.fs.readdirSync(_configFilePath)

/// clobber all of the files matching with 'config.js' in the filename together
const _config = _configFiles.reduce((out, configFilename) => configFilename.indexOf('config.js') !== -1 ? merge(out, require(path.join(_configFilePath, configFilename))) : out, { _configFilePath, _configFiles })

/// Return the clobfiguration
module.exports = _config
module.exports._configFilePath = _configFilePath
module.exports._configFiles = _configFiles
