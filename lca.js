const crypto = require("crypto");
const MAP = new Map();

// Wrong Ref: https://www.geeksforgeeks.org/lca-n-ary-tree-constant-query-o1/
// Ref: https://www.geeksforgeeks.org/lca-for-general-or-n-ary-trees-sparse-matrix-dp-approach-onlogn-ologn/


// Ref: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/solution/

function dfs(depth, parent, tree, cur, prev) { // Find the depth of each node and the first parent of each node.
	depth[cur] = depth[prev] + 1;
	parent[cur][0] = prev;

	for (let i = 0; i < tree[cur].length; i++) {
		if (tree[cur][i] != prev) {
			dfs(depth, parent, tree, tree[cur][i], cur);
		}
	}
}

exports.build = (edges, maxn = 100000) => {
	const uuid = crypto.randomUUID();

	const hierarchy = {
		maxn: maxn,
		level: Math.ceil(Math.log(maxn) / Math.log(2)) + 1, // Can have problems. Based on binary tree. What is the max number of children?
		tree: Array.from(Array(maxn), () => Array()),
		depth: Array(maxn).fill(0),
		parent: Array.from(Array(maxn), () => Array(Math.ceil(Math.log(maxn) / Math.log(2)) + 1).fill(-1)),
	};

	// UNNECESSARY
	// // memset
	// for (let i = 0; i < hierarchy.maxn; i++) {
	// 	for (let j = 0; j < hierarchy.level; j++) {
	// 		hierarchy.parent[i][j] = -1;
	// 	}
	// }

	// add edges
	if (edges) {
		for (const edge of edges) {
			hierarchy.tree[edge[0]].push(edge[1]);
			hierarchy.tree[edge[1]].push(edge[0]);
		}
		// UNNECESSARY
		// hierarchy.depth[0] = 0;

		dfs(hierarchy.depth, hierarchy.parent, hierarchy.tree, 1, 0);

		// precomputeSparseMatrix
		for (let i = 1; i < hierarchy.level; i++) {
			// Level by level traverse on tree
			for (let node = 1; node <= edges.length + 1; node++) {
				// Each node for each level
				if (hierarchy.parent[node][i - 1] != -1) {
					// Not Root
					hierarchy.parent[node][i] = hierarchy.parent[hierarchy.parent[node][i - 1]][i - 1]; // Set grandparent for current level.
				}
			}
		}

		MAP.set(uuid, hierarchy);
		return uuid;
	}

	return null;
};

exports.find = (uuid, u, v) => {
	const hierarchy = MAP.get(uuid);

	if (hierarchy) {
		if (hierarchy.depth[v] < hierarchy.depth[u]) { // v is above u
			// swap u and v to make u above v
			u += v;
			v = u - v;
			u -= v;
		}

		// always u is above v.

		let diff = hierarchy.depth[v] - hierarchy.depth[u]; // always >= 0

		for (let i = 0; i < hierarchy.level; i++) {
			if (((diff >> i) & 1) == 1) { // (diff >> i) is odd
				v = hierarchy.parent[v][i];
			}
		}

		// Now, u and v are on the same level.

		if (u == v) { // if u was the parent of v.
			return u;
		}

		for (let i = hierarchy.level - 1; i >= 0; i--) { // iterate levels from ground to the root. 
			if (hierarchy.parent[u][i] != hierarchy.parent[v][i]) { // Continue until finding the common parent.
				u = hierarchy.parent[u][i];
				v = hierarchy.parent[v][i];
			}
		}

		return hierarchy.parent[u][0]; // return the common parent.
	}
};

exports.destroy = (uuid) => {
	return MAP.delete(uuid);
};