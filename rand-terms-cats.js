import { initialize, Library } from "./core.js";
import RandTerms from "./rand-terms.js";

class RandTermsCats extends Library {
	vars = {
		catCount: "RandTermsCats_Count",
	};

	termsByCat = {};

	async _init() {
		const { terms } = RandTerms;
		if (!terms || terms.length === 0) {
			this.error("No terms found");
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
	}

	randomize() {
		const categories = Object.keys(this.termsByCat);
		let catCount = this.getVar(this.vars.catCount);
		if (!catCount || catCount < 1) {
			this.warn(`Var ${this.vars.catCount} not set, using all categories`);
			catCount = categories.length;
		}
		else if (catCount > categories.length) {
			this.warn(`Var ${this.vars.catCount} exceeds number of categories, using all categories`);
			catCount = categories.length;
		}

		const termCount = RandTerms._getTermCount();
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
				this.setVar(`Term${c + 1}_${i + 1}`, term.term);
				this.setVar(`Def${c + 1}_${i + 1}`, term.definition);
			}

			// this.log(randCats[c], randTerms.map(t => t.term).join(", "));
		}
	}
}

export default await initialize(RandTermsCats);
