/**
 * Module dependencies.
 */
const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')
const appRoot = require('app-root-path')

class Clobfig {

	constructor(configFolderName = 'config', configSelectors = ['config.js'], dataSelectors = ['.json']) {

		/// Determine root configuration folder
		this._configFilePathRelative = path.join(__dirname, `../${configFolderName}`)
		this._configFilePathAppRoot = !!require.main ? path.dirname(require.main.filename) : (!!process.mainModule ? path.dirname(process.mainModule.filename) : process.cwd())
		this._configFilePathAppRoot = fs.existsSync(this._configFilePathAppRoot) ? path.join(this._configFilePathAppRoot, configFolderName) : path.join(appRoot.path, configFolderName)

		/// include files that match this in their filename (including extension)
		this._configSelectors = configSelectors
		this._dataSelectors = dataSelectors

		const relativePathExists = fs.existsSync(this._configFilePathRelative)
		const appRootPathExists = !relativePathExists ? fs.existsSync(this._configFilePathAppRoot) : false

		if (!relativePathExists && !appRootPathExists) {
			return
		}

		const configFilePath = path.resolve(relativePathExists ? this._configFilePathRelative : this._configFilePathAppRoot)

		this.getConfig(configFilePath)

	}

	getConfigurationFilesData(configFilePath) {

		/// Set the new config folder
		this._configFilePath = !!configFilePath ? configFilePath : this._configFilePath

		/// Get all of the config files in the configuration folder
		const allFilesInConfigFolder = fs.readdirSync(this._configFilePath)
		const configFiles = []
		const dataFilesAdded = {}

		const filterConfigFiles = (filename) => this._configSelectors.reduce((o, s) => o || filename.indexOf(s) !== -1, false)
		const filterDataFiles = (filename) => this._dataSelectors.reduce((o, s) => o || (filename !== 'config.json' && filename.indexOf(s) !== -1), false)
		const addEachDataFile = (dataFilename) => dataFilesAdded[dataFilename.replace('.json', '')] = require(path.join(this._configFilePath, dataFilename))
		const clobber = (out, configFilename) => merge(out, require(path.join(this._configFilePath, configFilename)))
		const reorderConfigFiles = (configFilename) => configFilename.indexOf('config.json') !== -1 && configFiles.length ? configFiles.unshift(configFilename) : configFiles.push(configFilename)

		/// Get all of the config files in the configuration folder that match these selectors to be clobbed together
		this._configFiles = allFilesInConfigFolder.filter(filterConfigFiles)
		/// Add the data from each of the data files to the clobfig object (ex: pages.json => clobfig.pages)
		this._configFiles.forEach(reorderConfigFiles)

		/// Get all of the json data files in the configuration folder that match these selectors to be added to the config under the name of the json file
		this._dataFiles = allFilesInConfigFolder.filter(filterDataFiles)
		/// Add the data from each of the data files to the clobfig object (ex: pages.json => clobfig.pages)
		this._dataFiles.forEach(addEachDataFile)

		/// clobber all of the files matching with 'config.js' in the filename together, starting with the added objects
		this.config = merge(dataFilesAdded, configFiles.reduce(clobber, {}))

	}

	getConfig(configFilePath) {

		if (!!configFilePath) {
			this.getConfigurationFilesData(configFilePath)
		}

		if (!this.config) {
			return {}
		}

		const _exports = this.config
		_exports._configFilePathRelative = this._configFilePathRelative
		_exports._configFilePathAppRoot = this._configFilePathAppRoot
		_exports._configFilePath = this._configFilePath
		_exports._configSelectors = this._configSelectors
		_exports._configFiles = this._configFiles
		_exports._dataSelectors = this._dataSelectors
		_exports._dataFiles = this._dataFiles

		return _exports

	}

}

const ClobfigFactory = (configFolderName) => {

	this.Clobfig = Clobfig

	const clobfig = new Clobfig(configFolderName)

	const config = clobfig.getConfig()

	config.Clobfig = Clobfig

	return config

}

/// Return the clobfiguration factory method [ usage: const config = require('clobfig)() ]
module.exports = ClobfigFactory
