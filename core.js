// TODO
// - libs need to export a list of Storyline vars (with types) that storyline-project-tools can generate,
// 		that can be accessed without initializing the lib.

// ALSO
// look into using a web object to more easily load required libs. could be an HTML file with JS that reads list of libs from query string.
// current issue: libs need to load in story.html, not in an iframe.

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

	/** @abstract */
	async _init() { return; }

	/**
	 * @param {string} name
	 * @param {StorylineVar | null} defaultValue
	 * @returns {StorylineVar | null}
	 */
	getVar(name, defaultValue = null) {
		// TODO find a way to check if var exists and avoid calling GetVar again if it doesn't
		const val = this.player.GetVar(name);
		return val === null ? defaultValue : val;
	}

	/**
	 * @param {string} name
	 * @param {StorylineVar} value
	 */
	setVar(name, value) {
		// TODO find a way to check if var exists and avoid calling SetVar again if it doesn't
		this.player.SetVar(name, value);
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
