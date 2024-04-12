window.RandTermsCats = {
	dependencies: ["ecpi-interactives-lti", "rand-terms"],

	vars: {
		catCount: "RandTermsCats_Count",
	},

	player: null,
	termsByCat: {},

	async _init() {
		console.log("RandTermsCats: Initializing");

		// eslint-disable-next-line no-undef
		this.player = GetPlayer();

		const { terms } = window.RandTerms;
		if (!terms || terms.length === 0) {
			console.error("RandTermsCats: No terms found");
			return;
		}

		// terms need to stay in the same order in each category, since this is
		// used for Jeopardy-style games, where terms are ordered by difficulty.
		this.termsByCat = terms.reduce((acc, term) => {
			if (!acc[term.category])
				acc[term.category] = [];
			acc[term.category].push(term);
			return acc;
		}, {});
	},

	randomize() {
		const { player } = this;
		const categories = Object.keys(this.termsByCat);
		let catCount = player.GetVar(this.vars.catCount);
		if (!catCount || catCount < 1) {
			console.warn(`RandTermsCats: ${this.vars.catCount} not set, using all categories`);
			catCount = categories.length;
		}
		else if (catCount > categories.length) {
			console.warn(`RandTermsCats: ${this.vars.catCount} exceeds number of categories, using all categories`);
			catCount = categories.length;
		}

		const termCount = window.RandTerms._getTermCount();
		const randCats = [...categories].sort(() => Math.random() - 0.5);
		for (let c = 0; c < catCount; c++) {
			const terms = this.termsByCat[randCats[c]];
			const randTerms =
				[...Array(terms.length).keys()]			// array of indexes, up to term count
					.sort(() => Math.random() - 0.5)	// shuffle
					.slice(0, termCount)				// take first n
					.sort((a, b) => a - b)				// sort back into order
					.map(i => terms[i]);				// get term from index

			for (let i = 0; i < termCount; i++) {
				const term = randTerms[i];
				player.SetVar(`Term${c + 1}_${i + 1}`, term.term);
				player.SetVar(`Def${c + 1}_${i + 1}`, term.definition);
			}

			// console.log(randCats[c], randTerms.map(t => t.term).join(", "));
		}
	},
};

window.RandTermsCats._init().then(() => {
	if (window.onScriptLoaded)
		window.onScriptLoaded();
}).catch(console.error);
