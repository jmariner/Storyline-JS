/*
 * Storyline Syntax Highlighting
 * This script enables syntax highlighting for code snippets in Storyline slides.
 *
 * To use, add this JavaScript code in a Slide Start trigger on the master slide, then
 * write "SYNTAX HIGHLIGHT: language" at the top of the text you want to highlight,
 * where "language" is the programming language (e.g. C++, Java, etc).
 *
 * Text boxes should include the plain text version of the code snippet; if you run into issues with
 * lines being combined together, copy/paste to a plain text editor (Notepad) then back into Storyline
 * to reset the formatting.
 *
 * This script completely replaces the contents of the matching text boxes when triggered,
 * so any other formatting applied to the text box (background etc) will be lost.
 * Use other objects behind the text box if you want to preserve styling.
 *
 * This should work in preview mode, even when previewing only a single slide.
 */

// Theme ID from https://highlightjs.org/demo without "-min"
const THEME_ID = "vs";
const DEBUG = false;

(async () => {
	const HIGHLIGHT_SCRIPT_ID = "storyline-hljs-script";
	const HIGHLIGHT_THEME_ID = "storyline-hljs-theme";
	const HIGHLIGHT_SCRIPT_SRC =
		"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
	const HIGHLIGHT_THEME_SRC = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${THEME_ID}.min.css`;
	const TARGET_SELECTOR = ".slide-object";
	const PREFIX_REGEX = /^\s*SYNTAX\s+HIGHLIGHT\s*:\s*(\S+)(?:\s+|$)/i;

	function debug(...args) {
		if (!DEBUG) return;
		console.warn("[Storyline Syntax Highlight]", ...args);
	}

	function loadScriptOnce(id, src) {
		const existing = document.getElementById(id);
		if (existing) {
			debug("Script already present", { id, src });
			return Promise.resolve();
		}

		debug("Loading script", { id, src });

		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.id = id;
			script.src = src;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error(`Failed to load script: ${src}`));
			document.head.appendChild(script);
		});
	}

	function loadStylesheetOnce(id, href) {
		if (document.getElementById(id)) {
			debug("Stylesheet already present", { id, href });
			return;
		}

		debug("Loading stylesheet", { id, href });

		const link = document.createElement("link");
		link.id = id;
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}

	async function ensureHighlightJs() {
		if (window.hljs) {
			debug("highlight.js already available on window");
			return window.hljs;
		}

		loadStylesheetOnce(HIGHLIGHT_THEME_ID, HIGHLIGHT_THEME_SRC);
		await loadScriptOnce(HIGHLIGHT_SCRIPT_ID, HIGHLIGHT_SCRIPT_SRC);
		debug("highlight.js script load finished");

		if (!window.hljs)
			throw new Error(
				"highlight.js loaded but window.hljs is not available",
			);

		return window.hljs;
	}

	function extractCodeTextRaw(el) {
		const clone = el.cloneNode(true);

		for (const node of clone.querySelectorAll("script, style"))
			node.remove();

		// Target the textlib container if it exists, otherwise use the whole element
		const contentContainer =
			clone.querySelector(".textlib-content-wrap") || clone;
		const paragraphs = contentContainer.querySelectorAll("p");

		let rawText;
		if (paragraphs.length > 0) {
			// Extract lines from paragraphs, splitting on <br> tags
			const allLines = [];
			for (const p of Array.from(paragraphs)) {
				const linesInP = extractLinesFromParagraph(p);
				for (const line of linesInP) {
					allLines.push(line.replace(/\u00a0/g, " ").trimEnd());
				}
			}
			rawText = allLines.join("\n");
		} else {
			rawText = (
				contentContainer.innerText ||
				contentContainer.textContent ||
				""
			).trimEnd();
		}

		return rawText;
	}

	function extractLinesFromParagraph(p) {
		const lines = [];
		let currentLine = "";

		for (const node of p.childNodes) {
			if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
				lines.push(currentLine);
				currentLine = "";
			} else {
				currentLine += node.innerText || node.textContent || "";
			}
		}
		if (currentLine) {
			lines.push(currentLine);
		}

		return lines;
	}

	function extractCodeText(rawText) {
		const cleaned = rawText.replace(PREFIX_REGEX, "").trimStart();

		debug("Extracted code text", {
			rawPreview: rawText.slice(0, 120),
			cleanedPreview: cleaned.slice(0, 120),
			rawLength: rawText.length,
			cleanedLength: cleaned.length,
		});
		return cleaned;
	}

	function renderHighlightedCode(el, highlightedHtml, language) {
		const container = el.querySelector(".textlib-content-wrap") || el;
		container.innerHTML = `<pre class="storyline-hljs-pre"><code class="hljs language-${language}">${highlightedHtml}</code></pre>`;

		const pre = container.querySelector("pre.storyline-hljs-pre");
		if (pre) {
			pre.style.margin = "0";
			pre.style.whiteSpace = "pre";
			pre.style.width = "100%";
			pre.style.boxSizing = "border-box";
			pre.style.tabSize = "4";
		}

		const code = container.querySelector("code.hljs");
		if (code) {
			code.style.padding = "0";
			code.style.backgroundColor = "transparent";
		}
	}

	function isBraceLanguage(language) {
		const braceLanguages = new Set([
			"c",
			"h",
			"cpp",
			"c++",
			"cc",
			"cxx",
			"hpp",
			"hxx",
			"java",
			"javascript",
			"js",
			"typescript",
			"ts",
			"c#",
			"cs",
			"go",
			"rust",
			"php",
		]);

		return braceLanguages.has(String(language || "").toLowerCase());
	}

	function countBracesOutsideStrings(line) {
		let openCount = 0;
		let closeCount = 0;
		let inSingleQuote = false;
		let inDoubleQuote = false;
		let inTemplate = false;
		let escaped = false;

		for (let i = 0; i < line.length; i += 1) {
			const ch = line[i];
			const next = i + 1 < line.length ? line[i + 1] : "";

			if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
				if (ch === "/" && next === "/") break;
			}

			if (escaped) {
				escaped = false;
				continue;
			}

			if (ch === "\\") {
				escaped = true;
				continue;
			}

			if (!inDoubleQuote && !inTemplate && ch === "'") {
				inSingleQuote = !inSingleQuote;
				continue;
			}

			if (!inSingleQuote && !inTemplate && ch === '"') {
				inDoubleQuote = !inDoubleQuote;
				continue;
			}

			if (!inSingleQuote && !inDoubleQuote && ch === "`") {
				inTemplate = !inTemplate;
				continue;
			}

			if (inSingleQuote || inDoubleQuote || inTemplate) continue;

			if (ch === "{") openCount += 1;
			else if (ch === "}") closeCount += 1;
		}

		return { openCount, closeCount };
	}

	function reindentPreservingContent(codeText, language) {
		if (!isBraceLanguage(language)) return codeText;

		const lang = String(language || "").toLowerCase();
		const isCppFamily = [
			"c++",
			"cpp",
			"cc",
			"cxx",
			"h",
			"hpp",
			"hxx",
		].includes(lang);

		const lines = codeText.replace(/\r\n?/g, "\n").split("\n");
		let indentLevel = 0;
		const tab = "\t";
		const result = [];
		let accessSectionBaseIndent = null;

		for (const line of lines) {
			const content = line.trimStart();

			if (content.length === 0) {
				result.push("");
				continue;
			}

			const startsWithClosingBrace = /^\}/.test(content);
			const baseIndentLevel = startsWithClosingBrace
				? Math.max(0, indentLevel - 1)
				: indentLevel;

			const isAccessSpecifier =
				isCppFamily &&
				/^(?:public|private|protected)\s*:/.test(content);

			const inAccessSection =
				accessSectionBaseIndent !== null &&
				!startsWithClosingBrace &&
				baseIndentLevel >= accessSectionBaseIndent &&
				!isAccessSpecifier;

			const lineIndentLevel = inAccessSection
				? baseIndentLevel + 1
				: baseIndentLevel;

			result.push(tab.repeat(lineIndentLevel) + content);

			if (isAccessSpecifier) accessSectionBaseIndent = baseIndentLevel;

			const { openCount, closeCount } =
				countBracesOutsideStrings(content);
			indentLevel = Math.max(0, indentLevel + openCount - closeCount);

			if (
				accessSectionBaseIndent !== null &&
				indentLevel < accessSectionBaseIndent
			)
				accessSectionBaseIndent = null;
		}

		return result.join("\n");
	}

	debug("Trigger started", { href: location.href });
	const hljs = await ensureHighlightJs();
	const targets = document.querySelectorAll(TARGET_SELECTOR);
	debug("Found target candidates", {
		selector: TARGET_SELECTOR,
		count: targets.length,
	});

	let processedCount = 0;

	for (const el of [...targets]) {
		if (el.dataset.syntaxHighlighted === "true") {
			debug("Skipping already-highlighted element", el);
			continue;
		}

		const rawText = extractCodeTextRaw(el);
		const match = rawText.match(PREFIX_REGEX);
		if (!match) {
			debug("Skipping element without marker", el);
			continue;
		}

		const language = match[1].trim();
		debug("Found marker", {
			el,
			language,
			rawPreview: rawText.slice(0, 100),
		});

		const codeText = extractCodeText(rawText);
		if (!codeText) {
			debug("Skipping element with empty code text", { el, language });
			continue;
		}

		let highlighted;
		const indentedCodeText = reindentPreservingContent(codeText, language);
		if (hljs.getLanguage(language))
			highlighted = hljs.highlight(indentedCodeText, {
				language,
				ignoreIllegals: true,
			}).value;
		else {
			debug("Language not registered; using auto-detect", {
				el,
				language,
			});
			highlighted = hljs.highlightAuto(indentedCodeText).value;
		}

		renderHighlightedCode(el, highlighted, language);
		el.dataset.syntaxHighlighted = "true";
		processedCount += 1;
		debug("Highlighted element", {
			el,
			language,
			outputLength: highlighted.length,
		});
	}

	debug("Trigger complete", {
		processedCount,
		candidateCount: targets.length,
	});
})().catch((err) => {
	console.error("[Storyline Syntax Highlight]", err);
});
