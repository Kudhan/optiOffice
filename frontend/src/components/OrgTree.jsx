import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function TreeNode({ node }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div className={`node-content ${node.role}`} onClick={() => setExpanded(!expanded)}>
        <div className="avatar">{node.full_name.charAt(0)}</div>
        <div className="info">
          <span className="name">{node.full_name}</span>
          <span className="role">{node.designation || node.role}</span>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="children">
          {node.children.map(child => (
            <TreeNode key={child.username} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgTree({ token }) {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await axios.get(`${API_URL}/organization/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTreeData(response.data);
      } catch (err) {
        console.error("Failed to fetch org tree", err);
      }
    };
    fetchTree();
  }, [token]);

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
