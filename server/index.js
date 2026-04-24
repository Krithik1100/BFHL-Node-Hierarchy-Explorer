const express = require('express');
const cors = require('cors');

const http = require('http');
const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger to help debug local connectivity
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// ── Identity ──────────────────────────────────────────────────────────────────
const USER_ID             = 'krithik_26';      // ← change to your name + DOB
const EMAIL_ID            = 'kk7350@srmist.edu.in'; // ← change to your college email
const COLLEGE_ROLL_NUMBER = 'RA2311026020062';               // ← change to your roll number

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns true if the trimmed entry is a valid X->Y (single uppercase letter each)
function isValid(entry) {
  return /^[A-Z]->[A-Z]$/.test(entry);
}

// Build adjacency list + parent tracking from valid, de-duped edges
function buildGraph(edges) {
  const children = {}; // node -> [child, ...]
  const parents  = {}; // node -> first-parent (string | undefined)
  const nodes    = new Set();

  for (const edge of edges) {
    const [p, c] = edge.split('->');
    nodes.add(p);
    nodes.add(c);

    if (!children[p]) children[p] = [];

    // Diamond / multi-parent: first-encountered parent wins
    if (parents[c] === undefined) {
      parents[c] = p;
      children[p].push(c);
    }
    // silently discard subsequent parent edges for same child
  }

  return { children, parents, nodes };
}

// Find connected components (undirected sense) among all nodes
function getComponents(nodes, children) {
  const visited    = new Set();
  const components = [];

  // Build undirected adjacency for component discovery
  const undirected = {};
  for (const n of nodes) {
    if (!undirected[n]) undirected[n] = new Set();
  }
  for (const [p, cs] of Object.entries(children)) {
    for (const c of cs) {
      if (!undirected[p]) undirected[p] = new Set();
      if (!undirected[c]) undirected[c] = new Set();
      undirected[p].add(c);
      undirected[c].add(p);
    }
  }

  for (const start of nodes) {
    if (visited.has(start)) continue;
    const component = [];
    const queue = [start];
    while (queue.length) {
      const n = queue.shift();
      if (visited.has(n)) continue;
      visited.add(n);
      component.push(n);
      for (const nb of (undirected[n] || [])) {
        if (!visited.has(nb)) queue.push(nb);
      }
    }
    components.push(component);
  }

  return components;
}

// Detect cycle via DFS (directed graph, within a component)
function hasCycle(startNodes, children) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = {};

  function dfs(n) {
    color[n] = GRAY;
    for (const c of (children[n] || [])) {
      if (color[c] === GRAY) return true;
      if (color[c] === WHITE && dfs(c)) return true;
    }
    color[n] = BLACK;
    return false;
  }

  for (const n of startNodes) {
    if (!color[n]) {
      color[n] = WHITE;
    }
  }
  for (const n of startNodes) {
    if (color[n] === WHITE) {
      if (dfs(n)) return true;
    }
  }
  return false;
}

// Build nested tree object recursively
function buildTree(node, children, visited = new Set()) {
  if (visited.has(node)) return {};
  visited.add(node);
  const obj = {};
  for (const c of (children[node] || [])) {
    obj[c] = buildTree(c, children, new Set(visited));
  }
  return obj;
}

// Compute depth (number of nodes on longest root-to-leaf path)
function computeDepth(node, children, memo = {}) {
  if (node in memo) return memo[node];
  const kids = children[node] || [];
  if (kids.length === 0) {
    memo[node] = 1;
    return 1;
  }
  const d = 1 + Math.max(...kids.map(c => computeDepth(c, children, memo)));
  memo[node] = d;
  return d;
}

// ── Main handler ──────────────────────────────────────────────────────────────
app.post('/bfhl', (req, res) => {
  const rawData = req.body?.data;

  if (!Array.isArray(rawData)) {
    return res.status(400).json({ error: '"data" must be an array' });
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges      = new Set();
  const validEdges     = [];

  for (const raw of rawData) {
    const entry = (typeof raw === 'string') ? raw.trim() : String(raw).trim();

    if (!isValid(entry)) {
      invalidEntries.push(entry === '' ? raw : entry); // keep original for empty
      continue;
    }

    if (seenEdges.has(entry)) {
      // Only add once to duplicate_edges even if repeated many times
      if (!duplicateEdges.includes(entry)) duplicateEdges.push(entry);
    } else {
      seenEdges.add(entry);
      validEdges.push(entry);
    }
  }

  const { children, parents, nodes } = buildGraph(validEdges);

  const components = getComponents(nodes, children);

  const hierarchies = [];

  for (const component of components) {
    // Find roots: nodes with no parent inside this component
    const compSet = new Set(component);
    const roots   = component.filter(n => !parents[n] || !compSet.has(parents[n]));

    // Restrict children to component only
    const localChildren = {};
    for (const n of component) {
      localChildren[n] = (children[n] || []).filter(c => compSet.has(c));
    }

    const cycleDetected = hasCycle(component, localChildren);

    let root;
    if (roots.length > 0) {
      root = roots.sort()[0]; // lexicographically smallest root
    } else {
      // Pure cycle — no node is un-parented
      root = component.slice().sort()[0];
    }

    if (cycleDetected) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const treeObj = { [root]: buildTree(root, localChildren) };
      const depth   = computeDepth(root, localChildren);
      hierarchies.push({ root, tree: treeObj, depth });
    }
  }

  // Summary
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic    = hierarchies.filter(h =>  h.has_cycle);

  let largestTreeRoot = '';
  if (nonCyclic.length > 0) {
    const best = nonCyclic.reduce((prev, curr) => {
      if (curr.depth > prev.depth) return curr;
      if (curr.depth === prev.depth && curr.root < prev.root) return curr;
      return prev;
    });
    largestTreeRoot = best.root;
  }

  const summary = {
    total_trees:       nonCyclic.length,
    total_cycles:      cyclic.length,
    largest_tree_root: largestTreeRoot,
  };

  return res.json({
    user_id:              USER_ID,
    email_id:             EMAIL_ID,
    college_roll_number:  COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries:      invalidEntries,
    duplicate_edges:      duplicateEdges,
    summary,
  });
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'BFHL API running' }));

// Configurable host/port and debug/self-check toggles
const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '3001', 10);
const DEBUG = !!process.env.DEBUG;

let server = null;

function startServer() {
  server = app.listen(PORT, HOST, () => {
    const addr = server.address();
    console.log(`BFHL API listening on ${addr.address}:${addr.port} (family: ${addr.family}) pid:${process.pid}`);
    if (DEBUG) console.log('Server address info:', addr);

    // Self-check disabled to prevent early shutdown issues in some environments
    // if (process.env.SELF_CHECK !== '0') { ... }
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} already in use. Another process may be listening.`);
      process.exit(1);
    } else if (err && err.code === 'EACCES') {
      console.error(`Permission denied attempting to bind to ${HOST}:${PORT}. Try running with elevated privileges or choose a different port.`);
      process.exit(1);
    } else {
      console.error('Server error:', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  });

  // Graceful shutdown (commented out to prevent premature exit)
  // process.on('SIGINT', () => shutdown('SIGINT'));
  // process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
