
// Configuration
const CONFIG = {
	defaultLang: 'zh',
	metaPath: (lang) => `../repowiki/${lang}/meta/repowiki-metadata.json`,
	contentBase: (lang) => `../repowiki/${lang}/content/`,
	repoUrl: 'https://github.com/opentranquil/tranquilos' // For edit links etc if needed
};

// State
let state = {
	lang: CONFIG.defaultLang,
	catalog: [],
	tree: [],
	currentDocId: null
};

// DOM Elements
const els = {
	langSwitch: document.getElementById('lang-switch'),
	nav: document.getElementById('doc-nav'),
	content: document.getElementById('content-area'),
	search: document.getElementById('doc-search')
};

// Init
async function init() {
	// Check URL params for lang or doc
	const params = new URLSearchParams(window.location.search);
	if (params.has('lang')) {
		state.lang = params.get('lang') === 'en' ? 'en' : 'zh';
	}

	updateLangUI();

	await loadMetadata();
	renderSidebar();

	// Load initial doc
	if (params.has('page')) {
		const targetId = params.get('page');
		loadDoc(targetId);
	} else {
		// Load first item as default
		const firstId = findFirstLeaf(state.tree);
		if (firstId) loadDoc(firstId);
	}

	// Event Listeners
	els.langSwitch.addEventListener('click', toggleLang);
	els.search.addEventListener('input', handleSearch);

	// Mermaid init
	mermaid.initialize({ startOnLoad: false, theme: 'dark' });
}

// Language Switching
function toggleLang() {
	state.lang = state.lang === 'zh' ? 'en' : 'zh';
	updateLangUI();
	// Reload metadata and content
	loadMetadata().then(() => {
		renderSidebar();
		if (state.currentDocId) {
			loadDoc(state.currentDocId);
		}
	});
}

function updateLangUI() {
	const isZh = state.lang === 'zh';
	els.langSwitch.innerHTML = isZh
		? `EN / <span class="accent">ZH</span>`
		: `<span class="accent">EN</span> / ZH`;
	document.documentElement.lang = state.lang;
}

// Data Loading
async function loadMetadata() {
	els.nav.innerHTML = '<div class="loading">Loading navigation...</div>';
	try {
		// Try loading metadata for current language
		const url = CONFIG.metaPath(state.lang);
		const resp = await fetch(url);
		if (!resp.ok) throw new Error(`Failed to load metadata: ${resp.status}`);
		const data = await resp.json();
		state.catalog = data.wiki_catalogs || [];
		state.tree = buildTree(state.catalog);
	} catch (e) {
		console.error(e);
		els.nav.innerHTML = '<div class="loading" style="color:red">Failed to load navigation structure.</div>';
	}
}

function buildTree(items) {
	const map = {};
	const tree = [];

	// Create nodes
	items.forEach(item => {
		map[item.id] = { ...item, children: [] };
	});

	// Link parents
	items.forEach(item => {
		if (item.parent_id && map[item.parent_id]) {
			map[item.parent_id].children.push(map[item.id]);
		} else {
			tree.push(map[item.id]); // Root items
		}
	});

	return tree;
}

// Sidebar Rendering
function renderSidebar() {
	els.nav.innerHTML = '';

	// Helper to render tree
	function renderLevel(nodes, level = 0) {
		const container = document.createElement('div');
		container.className = level === 0 ? 'nav-group' : 'nav-subgroup';

		nodes.forEach(node => {
			if (level === 0 && node.children.length > 0) {
				// Group Header
				const title = document.createElement('div');
				title.className = 'nav-group-title';
				title.textContent = node.name;
				container.appendChild(title);

				// Render children
				container.appendChild(renderLevel(node.children, level + 1));
			} else {
				// Item
				const item = document.createElement('a');
				item.className = 'nav-item';
				item.textContent = node.name;
				item.dataset.id = node.id;
				item.style.paddingLeft = `${1.5 + level * 0.5}rem`;

				item.onclick = (e) => {
					e.preventDefault();
					// Toggle active class
					document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
					item.classList.add('active');
					loadDoc(node.id);
				};

				container.appendChild(item);

				// Children of item
				if (node.children.length > 0) {
					container.appendChild(renderLevel(node.children, level + 1));
				}
			}
		});
		return container;
	}

	state.tree.forEach(root => {
		// If a root has no children, render it as item? 
		// Or if root has children, render as group.
		if (root.children && root.children.length > 0) {
			const group = document.createElement('div');
			group.className = 'nav-group';

			const title = document.createElement('div');
			title.className = 'nav-group-title';
			title.textContent = root.name;
			group.appendChild(title);

			group.appendChild(renderLevel(root.children, 1));
			els.nav.appendChild(group);
		} else {
			// Root item without children
			const item = document.createElement('a');
			item.className = 'nav-item';
			item.textContent = root.name;
			item.dataset.id = root.id;
			item.onclick = (e) => {
				e.preventDefault();
				document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
				item.classList.add('active');
				loadDoc(root.id);
			}
			els.nav.appendChild(item);
		}
	});
}

// Document Loading
async function loadDoc(id) {
	state.currentDocId = id;
	els.content.innerHTML = '<div class="loading">Loading content...</div>';

	// Find node and construct path
	const node = state.catalog.find(i => i.id === id);
	if (!node) return;

	// Update URL without reload
	const newUrl = `${window.location.pathname}?lang=${state.lang}&page=${id}`;
	window.history.pushState({ id }, node.name, newUrl);

	// Construct path: We need to traverse up to root to get the full path
	const pathSegments = getPathSegments(id); // e.g. ["项目概述", "项目介绍"]

	// Fetch strategies for markdown files
	const basePath = CONFIG.contentBase(state.lang);
	const pathString = pathSegments.join('/');

	// Build candidate paths to try
	const candidates = [
		`${basePath}${pathString}.md`,
	];

	// For root items, try directory/filename.md pattern
	if (pathSegments.length === 1) {
		candidates.push(`${basePath}${pathSegments[0]}/${pathSegments[0]}.md`);
	}

	// Try parent directory with node name as file
	if (pathSegments.length > 1) {
		const parentPath = pathSegments.slice(0, -1).join('/');
		const fileName = pathSegments[pathSegments.length - 1];
		candidates.push(`${basePath}${parentPath}/${fileName}.md`);
		candidates.push(`${basePath}${parentPath}/${fileName}/${fileName}.md`);
	}

	let markdown = null;
	let usedUrl = '';

	for (const url of candidates) {
		try {
			const resp = await fetch(url);
			if (resp.ok) {
				markdown = await resp.text();
				usedUrl = url;
				break;
			}
		} catch (e) {
			continue;
		}
	}

	if (markdown) {
		// Pre-process markdown if needed (e.g. fix image paths)
		renderContent(markdown, node.name);
	} else {
		if (state.lang === 'en') {
			renderContent("# Content Not Available\n\nThis documentation is not yet available in English.", "404");
		} else {
			renderContent("# 404 - Document Not Found\n\nCould not find document for **" + node.name + "**.\n\nChecked paths:\n" + candidates.map(c => `- ${c}`).join('\n'), "404");
		}
	}
}

function getPathSegments(id) {
	const segments = [];
	let current = state.catalog.find(i => i.id === id);
	while (current) {
		segments.unshift(current.name);
		if (current.parent_id) {
			current = state.catalog.find(i => i.id === current.parent_id);
		} else {
			current = null;
		}
	}
	return segments;
}

function renderContent(markdown, title) {
	// Configure Marked
	marked.setOptions({
		highlight: function (code, lang) {
			return code; // Use Prism later if needed, for now simple code blocks
		},
		breaks: true,
		gfm: true
	});

	const html = marked.parse(markdown);
	els.content.innerHTML = html;

	// Process cite tags - parse markdown inside cite tags
	// Use setTimeout to ensure DOM is fully updated
	setTimeout(() => {
		const citeTags = els.content.querySelectorAll('cite');
		citeTags.forEach(cite => {
			const innerMarkdown = cite.textContent;
			// Parse as full markdown to support lists, bold, links, etc.
			const innerHtml = marked.parse(innerMarkdown);
			cite.innerHTML = innerHtml;
		});
	}, 0);

	// Process Mermaid diagrams
	const mermaidBlocks = els.content.querySelectorAll('.language-mermaid');
	mermaidBlocks.forEach(block => {
		const div = document.createElement('div');
		div.className = 'mermaid';
		div.textContent = block.textContent;
		block.parentElement.replaceWith(div);
	});

	mermaid.init(undefined, document.querySelectorAll('.mermaid'));
}

function findFirstLeaf(nodes) {
	for (const node of nodes) {
		if (!node.children || node.children.length === 0) {
			return node.id;
		}
		const childLeaf = findFirstLeaf(node.children);
		if (childLeaf) return childLeaf;
	}
	return null;
}

function handleSearch(e) {
	const query = e.target.value.toLowerCase();
	const items = document.querySelectorAll('.nav-item');

	items.forEach(item => {
		const text = item.textContent.toLowerCase();
		if (text.includes(query)) {
			item.style.display = 'block';
			// Also show parent group if hidden?
			// Simple expansion logic could be added here
		} else {
			item.style.display = 'none';
		}
	});
}

// Run
init();
