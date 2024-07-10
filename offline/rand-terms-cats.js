class RandTermsCats {
	vars = {
		count: "RandTerms_Count",
		catCount: "RandTermsCats_Count",
	};

	allTermsByCat = {};
	randCategories = [];
	randTermsByCat = {};

	_getTermCount() {
		const count = this.getVar(this.vars.count);
		if (!count || count < 1) {
			this.warn(`Var ${this.vars.count} not set, using all terms`);
			return this.terms.length;
		}
		else if (count > this.terms.length) {
			this.warn(`Var ${this.vars.count} exceeds number of terms, using all terms`);
			return this.terms.length;
		}
		else {
			return count;
		}
	}

	_init() {
		this.player = GetPlayer();

		const terms = window.TERMS_EXCEL_DATA && window.TERMS_EXCEL_DATA.rows;
		if (!terms || terms.length === 0) {
			this.error("No terms found");
			return;
		}

		this.terms = terms;

		// terms need to stay in the same order in each category, since this is
		// used for Jeopardy-style games, where terms are ordered by difficulty.
		this.allTermsByCat = terms.reduce((acc, term) => {
			if (!acc[term.category])
				acc[term.category] = [];
			acc[term.category].push(term);
			return acc;
		}, {});

		this.randomize();
	}

	getVar(name, defaultValue = null) {
		const val = this.player.GetVar(name);
		if (val === null)
			return defaultValue;

		return val;
	}

	setVar(name, value) {
		if (this.getVar(name) === null)
			return;
		this.player.SetVar(name, value);
	}

	randomize() {
		const categories = Object.keys(this.allTermsByCat);
		let catCount = this.getVar(this.vars.catCount);
		if (!catCount || catCount < 1) {
			this.warn(`Var ${this.vars.catCount} not set, using all categories`);
			catCount = categories.length;
		}
		else if (catCount > categories.length) {
			this.warn(`Var ${this.vars.catCount} exceeds number of categories, using all categories`);
			catCount = categories.length;
		}

		this.randCategories = [...categories].sort(() => Math.random() - 0.5);
		this.randTermsByCat = {};

		const termCount = this._getTermCount();
		for (let c = 0; c < catCount; c++) {
			const curCategory = this.randCategories[c];

			const terms = this.allTermsByCat[curCategory];
			const randTerms =
				[...Array(terms.length).keys()]			// array of indexes, up to term count
					.sort(() => Math.random() - 0.5)	// shuffle
					.slice(0, termCount)				// take first n
					.sort((a, b) => a - b)				// sort back into order
					.map(i => terms[i]);				// get term from index

			this.randTermsByCat[curCategory] = randTerms;

			this.setVar(`Cat${c + 1}`, curCategory);
		}

		this.setVar("StorylineJS_Ready", true);
	}

	getTermInfo(termID) {
		const [cat, term] = termID.split(".");
		const catIndex = parseInt(cat, 10) - 1;
		const termIndex = parseInt(term, 10) - 1;
		const terms = this.randTermsByCat[this.randCategories[catIndex]];
		if (!terms)
			throw new Error(`Category ${cat} not found`);
		const info = terms[termIndex];
		if (!info)
			throw new Error(`Term ${term} not found in category ${cat}`);

		return {
			...info,
			termIndex,
			catIndex,
		};
	}
}

const randTermsCats = new RandTermsCats();
randTermsCats._init();
window.RandTermsCats = randTermsCats;
