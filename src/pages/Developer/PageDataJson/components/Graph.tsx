import { useState, useCallback, MouseEvent, ForwardRefRenderFunction, useEffect, useImperativeHandle, forwardRef } from "react";
import { NodeProps, ElkRoot, Canvas, Edge, EdgeProps } from 'reaflow';
import { useLongPress } from "use-long-press";
import { Space } from "react-zoomable-ui";

import { ExternalStore } from "store/interface";
import { GraphProps, NodeData } from "../interface";
import useToggleHide from "hooks/useToggleHide";
import { useExternal } from "store/useExternal";
import { useInternal } from "store/useInternal";
import { ThemeProvider } from "styled-components";
import { StyledEditorWrapper } from "./styles";
import { darkTheme, lightTheme } from "../constants";
import { CustomNode } from './CustomNode';

export type GraphRef = ExternalStore;

const layoutOptions = {
  "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
};

const CanvasGraph = ({
  onNodeClick,
  onLayoutChange: layoutChangeFn,
}: Pick<GraphProps, 'onLayoutChange' | 'onNodeClick'>) => {
  const { validateHiddenNodes } = useToggleHide();

  // internal
  const setLoading = useInternal(state => state.setLoading);
  const setSelectedNode = useInternal(state => state.setSelectedNode);
  const nodes = useInternal(state => state.nodes);
  const edges = useInternal(state => state.edges);

  // external
  const direction = useExternal(state => state.direction);
  const setCanvas = useExternal(state => state.setCanvas);

  // local states
  const [paneWidth, setPaneWidth] = useState(2000);
  const [paneHeight, setPaneHeight] = useState(2000);

  const handleNodeClick = useCallback(
    (_: MouseEvent<SVGElement>, data: NodeData) => {
      if (setSelectedNode) setSelectedNode(data);
      if (onNodeClick) onNodeClick(data);
    },
    [onNodeClick, setSelectedNode]
  );

  const memoizedNode = useCallback(
    (props: JSX.IntrinsicAttributes & NodeProps) => (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      <CustomNode {...props} onClick={handleNodeClick} animated={false} />
    ),
    [handleNodeClick]
  );

  const memoizedEdge = useCallback(
    (props: JSX.IntrinsicAttributes & Partial<EdgeProps>) => (
      <Edge {...props} containerClassName={`edge-${props.id}`} />
    ),
    []
  );

  const onLayoutChange = useCallback(
    (layout: ElkRoot) => {
      if (layout.width && layout.height) {
        setPaneWidth(layout.width + 50);
        setPaneHeight((layout.height as number) + 50);

        window.requestAnimationFrame(() => {
          setLoading(false);
          validateHiddenNodes();
          if (layoutChangeFn) layoutChangeFn(layout);
        });
      }
    },
    [setLoading, validateHiddenNodes, layoutChangeFn]
  );

  console.log(nodes)

  return (
    <Canvas
      nodes={nodes}
      edges={edges}
      maxHeight={paneHeight}
      maxWidth={paneWidth}
      height={paneHeight}
      width={paneWidth}
      direction={direction}
      layoutOptions={layoutOptions}
      onLayoutChange={onLayoutChange}
      node={memoizedNode}
      edge={memoizedEdge}
      key={direction}
      pannable={false}
      zoomable={false}
      animated={false}
      readonly={true}
      dragEdge={null}
      dragNode={null}
      fit={true}
      ref={setCanvas}
    />
  );
};

const GraphRef: ForwardRefRenderFunction<GraphRef, GraphProps> = (
  {
    json, onNodeClick, layout, onLayoutChange, ...props
  },
  ref
) => {
  // external
  const setViewPort = useExternal(state => state.setViewPort);
  const setJson = useExternal(state => state.setJson);
  const setConfig = useExternal(state => state.setConfig);
  const getCanvas = useExternal(state => state.getCanvas);
  const theme = useExternal(state => state.theme);

  // set graph ref values
  useImperativeHandle(ref, () => useExternal.getState());

  useEffect(() => {
    if (json) setJson(json);
  }, [json, setJson]);

  useEffect(() => {
    if (layout) setConfig(layout);
  }, [layout, setConfig]);

  const callback = useCallback(() => {
    getCanvas()?.containerRef.current?.classList.add("dragging");
  }, [getCanvas]);

  const bindLongPress = useLongPress(callback, {
    threshold: 150,
    onFinish: () => {
      getCanvas()?.containerRef.current?.classList.remove("dragging");
    },
  });

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <StyledEditorWrapper {...props} {...bindLongPress()}>
        <Space
          onCreate={setViewPort}
          onUpdated={e => e.updateContainerSize()}
          treatTwoFingerTrackPadGesturesLikeTouch
          pollForElementResizing
        >
          <CanvasGraph onLayoutChange={onLayoutChange} onNodeClick={onNodeClick} />
        </Space>
      </StyledEditorWrapper>
    </ThemeProvider>
  )
}

export const Graph = forwardRef<GraphRef, GraphProps>(GraphRef);

