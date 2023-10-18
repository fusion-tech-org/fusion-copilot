import GridLayout from 'react-grid-layout';

export const QuadrantTime = () => {
  const layout = [
    // i: 组件key值, x: 组件在x轴的坐标, y: 组件在y轴的坐标, w: 组件宽度, h: 组件高度
    // static: true，代表组件不能拖动
    { i: "a", x: 0, y: 0, w: 1, h: 3, static: true },
    // minW/maxW 组件可以缩放的最大最小宽度
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];

  return (
    <GridLayout
      className="layout"
      layout={layout} // 组件的布局参数配置
      cols={12} // 栅格列数配置，默认12列
      rowHeight={30} // 指定网格布局中每一行的高度, 这里设置为30px
      width={1200} // 设置容器的初始宽度
    >
      <div key="a" className="bg-slate-400">组件A</div>
      <div key="b" className="bg-red-300">组件B</div>
      <div key="c" className="bg-yellow-100">组件C</div>
    </GridLayout>
  )
};