// TODO
// - libs need to export a list of Storyline vars (with types) that storyline-project-tools can generate,
// 		that can be accessed without initializing the lib.

// TODO need to figure out cache-busting; currently jsdelivr caches: https://www.jsdelivr.com/documentation#id-caching

// ALSO
// look into triggering JS functions by listening for a boolean Storyline var changing to true, then reset the var to false.
// this would need to properly handle a varible not existing, where it won't continue checking for it changing. GetVar returning null good enough?

/**
 * @typedef {string | boolean | number} StorylineVar
 *
 * @typedef {object} StorylinePlayer
 * @property {(name: string) => StorylineVar | null} GetVar
 * @property {(name: string, value: StorylineVar) => void} SetVar
 */
/** @type {StorylinePlayer} */
// eslint-disable-next-line no-undef
const player = typeof GetPlayer === "function" ? GetPlayer() : null;

export class Library {
	player = player;
	missingVars = [];

	/** @abstract */
	async _init() { return; }

	/**
	 * @param {string} name
	 * @param {StorylineVar | null} defaultValue
	 * @returns {StorylineVar | null}
	 */
	getVar(name, defaultValue = null) {
		if (this.missingVars.includes(name))
			return defaultValue;

		const val = this.player.GetVar(name);
		if (val === null) {
			this.missingVars.push(name);
			return defaultValue;
		}

		return val;
	}

	/**
	 * @param {string} name
	 * @param {StorylineVar} value
	 */
	setVar(name, value) {
		if (this.getVar(name) === null)
			return;
		this.player.SetVar(name, value);
	}

	/**
	 * @template {string} K
	 * @param {K[]} varNames
	 * @param {Record<K, any>} defaultObj
	 * @returns {Record<K, StorylineVar>}
	 */
	getVars(varNames, defaultObj = {}) {
		return varNames.reduce((acc, name) => {
			acc[name] = this.getVar(name, defaultObj[name]);
			return acc;
		}, {});
	}

	/**
	 * @param {Record<string, any>} varObj
	 */
	setVars(varObj) {
		for (const [name, value] of Object.entries(varObj))
			this.setVar(name, value);
	}

	log(...args) {
		console.log(`[${this.constructor.name}]`, ...args);
	}

	warn(...args) {
		console.warn(`[${this.constructor.name}]`, ...args);
	}

	error(...args) {
		console.error(`[${this.constructor.name}]`, ...args);
	}
}

/**
 * @template {Library} T
 * @param {new () => T} LibClass
 * @returns {Promise<T>}
 */
export async function initialize(LibClass) {

	const name = LibClass.name;
	const lib = new LibClass();

	lib.log("Initializing library");
	if (typeof lib._init === "function")
		await lib._init();

	if (typeof window === "object") {
		if (name in window)
			lib.warn(`Library already exists in window, overwriting`);
		window[name] = lib;
	}

	return lib;
}