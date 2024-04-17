import { initialize, Library } from "./core.js";

class LTI extends Library {
	moduleID = "ecpi-interactives-lti";

	vars = {
		enabled: "LTI_Enabled",
		versionID: "LTI_VersionID",
		triggerComplete: "LTI_TriggerComplete",
	};

	enabled = false;
	versionID = null;
	data = null;

	paths = {};

	async _init() {
		const params = new URLSearchParams(location.search);
		this.versionID = params.get("versionID");

		this.setVar(this.vars.versionID, this.versionID);

		const pathsUrl = params.get("pathsUrl");
		if (pathsUrl) {
			const pathsResp = await this._fetch("GET", pathsUrl);
			this.paths = await pathsResp.json();
		}

		this.enabled = ["1", "true"].includes(params.get("lti"));
		if (!this.enabled) return;

		if (!this.paths.dataJson || !this.paths.submit)
			throw new Error("Missing required path in paths");

		const dataResp = await this._fetch("GET", this.paths.dataJson);
		const { data } = await dataResp.json();
		this.data = data;

		this.setVar(this.vars.enabled, true);
	}

	triggerComplete() {
		if (window.parent)
			window.parent.postMessage("app complete", "*");
		document.dispatchEvent(new Event("unity:quit"));
	}

	submit(...resultArgs) {
		const hasScore = typeof resultArgs[0] === "number";
		const hasText = resultArgs.length > (hasScore ? 1 : 0);
		const text = resultArgs
			.slice(hasScore ? 1 : 0)
			.join("<br/>")
			.replace(/\r?\n/g, "<br/>");
		const results = {};
		if (hasScore) results.score = resultArgs[0];
		if (hasText) results.text = text;

		const handleFail = (err) => {
			if (err)
				this.error(err);
			if (confirm("LTI Submission failed; see console for details.\n\nPress OK to open results preview in new tab.")) {
				const previewHTML = [
					hasScore ? `<p><b>Score:</b> ${results.score}</p>` : "",
					hasText ? `<p>${results.text}</p>` : "",
				].join("<hr/>");
				const previewURL = URL.createObjectURL(new Blob([previewHTML], { type: "text/html" }));
				open(previewURL);
			}
		};

		if (!this.enabled) {
			this.warn("LTI not connected, submission not available. Results:", results);
			handleFail();
			return;
		}

		if (!hasScore && !hasText) {
			handleFail("No results to submit.");
			return;
		}

		this._fetch("POST", this.paths.submit, {
			body: JSON.stringify(results)
		}).then(() => {
			if (this.getVar(this.vars.triggerComplete, false))
				this.triggerComplete();
		}).catch(handleFail);
	}

	// TODO custom data API (get/set)

	async getLiveExcelData(site, fileId, sheet, array) {
		const url = new URL(this.paths.liveDataExcel);
		url.searchParams.set("site", site);
		url.searchParams.set("fileId", fileId);
		if (sheet) url.searchParams.set("sheet", sheet);
		if (array) url.searchParams.set("array", array);

		const excelDataResp = await this._fetch("GET", url);
		return excelDataResp.json();
	}
}

export default await initialize(LTI);
