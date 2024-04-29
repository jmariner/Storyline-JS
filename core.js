// TODO
// - libs need to export a list of Storyline vars (with types) that storyline-project-tools can generate,
// 		that can be accessed without initializing the lib.

// TODO need to figure out cache-busting; currently jsdelivr caches: https://www.jsdelivr.com/documentation#id-caching
// caching is still a problem - purging doesn't always work even when it says it does.
// consider setting up something with Github Actions to auto-update a hosted version of the code.
// though either way, the browser cache may still hold old versions for longer than desired. Maybe a custom server that can
// allows browser caching only until a new commit is made.

// best way to deal with caching is being able to update the URLs when needed, so look into a server that can
// serve a list of module URLs (or whole HTML snippet) with each URL having a cache-busting query string computed from the commit hash.
// though would need to figure out how to apply that query string to the imported URLs in the JS modules. import-map?

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

const isReview = location.href.startsWith("https://articulateusercontent.com/review/");

export class Library {
	/**
	 * @abstract
	 * @type {string}
	 * This must be set to the name of the module file, without path or file extension.
	 */
	moduleID = null;

	player = player;
	isReview = isReview;
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

	async _fetch(method, url, options = {}) {
		let headers = method === "POST" ? { "Content-Type": "application/json" } : {};
		if (options.headers)
			headers = { ...headers, ...options.headers };
		const resp = await fetch(url, {
			...options,
			method,
			headers,
		});

		if (!resp.ok)
			throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

		return resp;
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
			lib.warn(`Library "${name}" already exists in window, overwriting`);
		window[name] = lib;

		if (lib.moduleID === null)
			throw new Error(`Library "${name}" missing moduleID`);

		window.StorylineJS_LibLoaded(lib.moduleID);
	}

	return lib;
}
