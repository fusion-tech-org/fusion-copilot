import { useDynamicSvgImport } from './useDynamicSvgImport';

interface IProps {
  iconName: string;
  wrapperStyle?: string;
  width?: number;
  height?: number;
  fill?: string;
  svgStyle?: React.SVGProps<SVGSVGElement>;
}

export default function SvgIcon(props: IProps) {
  const { iconName, wrapperStyle, svgStyle } = props;
  const { loading, Icon } = useDynamicSvgImport(iconName);

  return (
    <>
      {loading && (
        <div className="rounded-full bg-slate-400 animate-pulse h-8 w-8"></div>
      )}
      {Icon && (
        <div className={wrapperStyle}>
          <Icon {...svgStyle} />
        </div>
      )}
    </>
  );
}
