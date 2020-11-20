/**
 * Module dependencies.
 */
const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')
const appRoot = require('app-root-path')

class Clobfig {

	constructor(configFolderName = 'config', configSelectors = ['config.js'], dataSelectors = ['.json']) {

		const calculatedAppRoot = !!require.main ? path.dirname(require.main.filename) : (!!process.mainModule ? path.dirname(process.mainModule.filename) : process.cwd())

		/// Determine root configuration folder
		this._configFilePathRelative = path.join(__dirname, `../${configFolderName}`)
		this._configFilePathAppRoot = fs.existsSync(calculatedAppRoot) ? calculatedAppRoot : appRoot.path

		/// include files that match this in their filename (including extension)
		this._configSelectors = configSelectors
		this._dataSelectors = dataSelectors

		const relativePathExists = fs.existsSync(this._configFilePathRelative)
		const appRootPathExists = !relativePathExists ? fs.existsSync(this._configFilePathAppRoot) : false

		if (!relativePathExists && !appRootPathExists) {
			return
		}

		this._appRootPath = path.resolve(relativePathExists ? this._configFilePathRelative : this._configFilePathAppRoot)
		this._configFilePath = path.join(this._appRootPath, configFolderName)

		appRoot.setPath(this._appRootPath)
		this.getConfig(this._configFilePath)

	}

	getConfigurationFilesData(configFilePath) {

		/// Set the new config folder
		this._configFilePath = !!configFilePath ? configFilePath : this._configFilePath

		/// Start with the basics
		const base = {
			// Unofficial
			_configFilePathRelativeL: this._configFilePathRelative,
			_configFilePathAppRoot: this._configFilePathAppRoot,
			_configSelectors: this._configSelectors,
			_configFiles: this._configFiles,
			_dataSelectors: this._dataSelectors,
			_dataFiles: this._dataFiles,

			// Official
			appRootPath: this._appRootPath,
			configFilePath: this._configFilePath,
		}

		/// Get all of the config files in the configuration folder
		const allFilesInConfigFolder = fs.readdirSync(this._configFilePath)
		const packageJson = this.getPackageJson()
		const configFiles = []
		const dataFilesAdded = {}

		/// Schema for pulling values from the package.json
		const jsonInjectSchema = (n, v) => v === `@${n}`
		const injectPackageJsonValues = (out, configField) => { out[configField] = packageJson[configField] !== 'undefined' && jsonInjectSchema(configField, out[configField]) ? packageJson[configField] : out[configField] ; return out}

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
		this.config = merge(base, merge(dataFilesAdded, configFiles.reduce(clobber, {})))

		/// finally infect the config with select values from the package json that are set to NaN
		this.config = Object.keys(this.config).reduce(injectPackageJsonValues, this.config)

	}

	getPackageJson(appRootPath = this._appRootPath) {
		const packageJsonFilePath = path.join(appRootPath, 'package.json')

		if (fs.existsSync(packageJsonFilePath)) {
			return require(packageJsonFilePath)
		}

		return {}
	}

	getConfig(configFilePath) {

		if (!!configFilePath) {
			this.getConfigurationFilesData(configFilePath)
		}

		if (!this.config) {
			return {}
		}

		return this.config

	}

}

const ClobfigFactory = (configFolderName) => {

	this.Clobfig = Clobfig

	const clobfig = new Clobfig(configFolderName)

	const config = clobfig.getConfig()

	config.Clobfig = Clobfig
	config.AppRoot = appRoot

	return config

}

/// Return the clobfiguration factory method [ usage: const config = require('clobfig)() ]
module.exports = ClobfigFactory
