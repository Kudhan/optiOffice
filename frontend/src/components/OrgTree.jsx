import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

function TreeNode({ node }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div className={`node-content ${node.role}`} onClick={() => setExpanded(!expanded)}>
        <div className="avatar text-sky-500 font-bold">{node.full_name.charAt(0)}</div>
        <div className="info">
          <span className="name text-slate-100 font-bold">{node.full_name}</span>
          <span className="role text-slate-500 text-xs font-semibold uppercase tracking-wider">{node.designation || node.role}</span>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="children ml-8 border-l border-slate-800 pl-4 mt-2 space-y-2">
          {node.children.map(child => (
            <TreeNode key={child.username} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgTree() {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await apiClient.get('organization/tree');
        setTreeData(response.data);
      } catch (err) {
        console.error("Failed to fetch org tree", err);
      }
    };
    fetchTree();
  }, []);

  return (
    <div className="org-tree-container">
      <h2>Organization Hierarchy</h2>
      <div className="tree-wrapper">
        {treeData.map(rootNode => (
          <TreeNode key={rootNode.username} node={rootNode} />
        ))}
      </div>
    </div>
  );
}

export default OrgTree;
