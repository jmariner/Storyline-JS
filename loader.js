// Copy/paste this into a Storyline trigger to load libraries.

function loadLibs(basePath, ...libs) {
	const existing = [...document.querySelectorAll("script[type=module]")];

	for (const src of libs) {
		const fullSrc = basePath + src + ".js";
		if (existing.some(el => el.src === fullSrc))
			continue;

		const scriptEl = document.createElement("script");
		scriptEl.type = "module";
		scriptEl.src = fullSrc;
		document.head.appendChild(scriptEl);
	}
}

// EX:
loadLibs(
	"https://cdn.jsdelivr.net/gh/jmariner/Storyline-JS/",
	"rand-terms-cats",
	"ecpi-interactives-lti"
);
