import { create } from 'zustand';
import { InternalActions, InternalStates } from './interface';
import { EdgeData } from 'pages/Developer/PageDataJson/interface';
import { getChildrenEdges } from 'pages/Developer/PageDataJson/utils/graph/getChildrenEdges';
import { getOutgoers } from 'pages/Developer/PageDataJson/utils/graph/getOutGoers';
import { useExternal } from './useExternal';

const initStates: InternalStates = {
  loading: true,
  selectedNode: null,
  nodes: [],
  edges: [],
  collapsedNodes: [],
  collapsedEdges: [],
  collapsedParents: [],
}

export const useInternal = create<InternalActions & InternalStates>()((set, get) => ({
  ...initStates,
  getCollapsedNodeIds: () => get().collapsedNodes,
  getCollapsedEdgeIds: () => get().collapsedEdges,
  setGraph: json => {
    import("../pages/Developer/PageDataJson/utils/json/jsonParser").then(c => {
      const { nodes, edges } = c.parser(json);

      useExternal.setState({ collapseNodes: false });

      set({
        nodes,
        edges,
        collapsedParents: [],
        collapsedNodes: [],
        collapsedEdges: [],
        loading: true,
      });
    });
  },
  refresh: () => {
    import("../pages/Developer/PageDataJson/utils/json/jsonParser").then(c => {
      const { nodes, edges } = c.parser(useExternal.getState().json);
      set({ nodes, edges });
    });
  },
  setLoading: loading => set({ loading }),
  setSelectedNode: nodeData => set({ selectedNode: nodeData }),
  expandNodes: nodeId => {
    const [childrenNodes, matchingNodes] = getOutgoers(
      nodeId,
      get().nodes,
      get().edges,
      get().collapsedParents
    );
    const childrenEdges = getChildrenEdges(childrenNodes, get().edges);

    const nodesConnectedToParent = childrenEdges.reduce((nodes: string[], edge: EdgeData) => {
      edge.from && !nodes.includes(edge.from) && nodes.push(edge.from);
      edge.to && !nodes.includes(edge.to) && nodes.push(edge.to);
      return nodes;
    }, []);
    const matchingNodesConnectedToParent = matchingNodes.filter(node =>
      nodesConnectedToParent.includes(node)
    );
    const nodeIds = childrenNodes.map(node => node.id).concat(matchingNodesConnectedToParent);
    const edgeIds = childrenEdges.map(edge => edge.id);

    const collapsedParents = get().collapsedParents.filter(cp => cp !== nodeId);
    const collapsedNodes = get().collapsedNodes.filter(nodeId => !nodeIds.includes(nodeId));
    const collapsedEdges = get().collapsedEdges.filter(edgeId => !edgeIds.includes(edgeId));

    set({
      collapsedParents,
      collapsedNodes,
      collapsedEdges,
    });

    useExternal.setState({ collapseNodes: !!collapsedNodes.length });
  },
  collapseNodes: nodeId => {
    const [childrenNodes] = getOutgoers(nodeId, get().nodes, get().edges);
    const childrenEdges = getChildrenEdges(childrenNodes, get().edges);

    const nodeIds = childrenNodes.map(node => node.id);
    const edgeIds = childrenEdges.map(edge => edge.id);

    set({
      collapsedParents: get().collapsedParents.concat(nodeId),
      collapsedNodes: get().collapsedNodes.concat(nodeIds),
      collapsedEdges: get().collapsedEdges.concat(edgeIds),
    });

    useExternal.setState({
      collapseNodes: !!get().collapsedNodes.concat(nodeIds).length,
    });
  },
  collapseGraph: () => {
    const edges = get().edges;
    const tos = edges.map(edge => edge.to);
    const froms = edges.map(edge => edge.from);
    const parentNodesIds = froms.filter(id => !tos.includes(id));
    const secondDegreeNodesIds = edges
      .filter(edge => parentNodesIds.includes(edge.from))
      .map(edge => edge.to);

    const collapsedParents = get()
      .nodes.filter(node => !parentNodesIds.includes(node.id) && node.data?.isParent)
      .map(node => node.id);

    const collapsedNodes = get()
      .nodes.filter(
        node => !parentNodesIds.includes(node.id) && !secondDegreeNodesIds.includes(node.id)
      )
      .map(node => node.id);

    // const closestParentToRoot = Math.min(...collapsedParents.map(n => +n));
    // const focusNodeId = `g[id*='node-${closestParentToRoot}']`;
    // const rootNode = document.querySelector(focusNodeId);

    set({
      collapsedParents,
      collapsedNodes,
      collapsedEdges: get()
        .edges.filter(edge => !parentNodesIds.includes(edge.from))
        .map(edge => edge.id),
    });

    useExternal.setState({ collapseNodes: true });
  },
  expandGraph: () => {
    set({
      collapsedNodes: [],
      collapsedEdges: [],
      collapsedParents: [],
    });

    useExternal.setState({ collapseNodes: false });
  },
}))