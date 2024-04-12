window.RandTerms = {
	// TODO this doesn't do anything yet
	requires: ["ecpi-interactives-lti"],

	vars: {
		count: "RandTerms_Count",
		excelFileSite: "RandTerms_ExcelFileSite",
		excelFileId: "RandTerms_ExcelFileID",
		excelSheet: "RandTerms_ExcelSheet",
		excelArray: "RandTerms_ExcelArrayFields",
	},

	player: null,
	terms: [],

	_getTermCount() {
		const count = this.player.GetVar(this.vars.count);
		if (!count || count < 1) {
			console.warn("RandTerms: count not set, using all terms");
			return this.terms.length;
		}
		else if (count > this.terms.length) {
			console.warn("RandTerms: count exceeds number of terms, using all terms");
			return this.terms.length;
		}
		else {
			return count;
		}
	},

	async _init() {
		console.log("RandTerms: Initializing");

		// eslint-disable-next-line no-undef
		this.player = GetPlayer();

		const site = this.player.GetVar(this.vars.excelFileSite) || "sites/DLT";
		const fileId = this.player.GetVar(this.vars.excelFileId);
		const sheet = this.player.GetVar(this.vars.excelSheet);
		const array = this.player.GetVar(this.vars.excelArray);

		if (!fileId) {
			console.error(`RandTerms: Need Storyline Vars ${this.vars.excelFileId} to be set.`);
			return;
		}

		const { errors, rows } = await window.LTI.getLiveExcelData(site, fileId, sheet, array);
		if (errors.length) {
			console.error("RandTerms: Error fetching Excel data:", errors);
			return;
		}

		this.terms = rows;
	},

	randomize() {
		const count = this._getTermCount();

		const terms = [...this.terms].sort(() => Math.random() - 0.5);

		for (let i = 0; i < count; i++) {
			this.player.SetVar(`Term${i + 1}`, terms[i].term);
			this.player.SetVar(`Def${i + 1}`, terms[i].definition);
		}
	}
};

window.RandTerms._init().then(() => {
	if (window.onScriptLoaded)
		window.onScriptLoaded();
}).catch(console.error);
