import { initialize, Library } from "./core.js";
import LTI from "./ecpi-interactives-lti.js";

class RandTerms extends Library {
	moduleID = "rand-terms";

	vars = {
		count: "RandTerms_Count",
		excelFileSite: "RandTerms_ExcelFileSite",
		excelFileId: "RandTerms_ExcelFileID",
		excelSheet: "RandTerms_ExcelSheet",
		excelArray: "RandTerms_ExcelArrayFields",
		randomizeOnInit: "RandTerms_RandomizeOnInit",
	};

	terms = [];

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

	async _init() {
		const site = this.getVar(this.vars.excelFileSite, "sites/DLT");
		const fileId = this.getVar(this.vars.excelFileId);
		const sheet = this.getVar(this.vars.excelSheet);
		const array = this.getVar(this.vars.excelArray);

		if (!fileId) {
			this.error(`Need Storyline Var ${this.vars.excelFileId} to be set.`);
			return;
		}

		const { errors, rows } = await LTI.getLiveExcelData(site, fileId, sheet, array);
		if (errors.length) {
			this.error("Error fetching Excel data:", errors);
			return;
		}

		this.terms = rows;

		if (this.getVar(this.vars.randomizeOnInit, false))
			this.randomize();
	}

	randomize() {
		const count = this._getTermCount();

		const terms = [...this.terms].sort(() => Math.random() - 0.5);

		for (let i = 0; i < count; i++) {
			this.setVar(`Term${i + 1}`, terms[i].term);
			this.setVar(`Def${i + 1}`, terms[i].definition);
		}
	}
}

export default await initialize(RandTerms);
