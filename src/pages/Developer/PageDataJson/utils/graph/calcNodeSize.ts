import { useExternal } from 'store/useExternal';

type Text = string | [string, string][];
type Size = { width: number; height: number };

export const isContentImage = (value: Text) => {
  if (typeof value !== "string") return false;

  const isImageURL = /(https?:\/\/.*\.(?:png|jpg|gif|svg))/i.test(value);
  const isBase64 = value.startsWith("data:image/") && value.includes("base64");

  return isImageURL || isBase64;
};

const calcLines = (text: Text): string => {
  if (typeof text === "string") {
    return text;
  } else {
    return text.map(([k, v]) => `${k}: ${JSON.stringify(v).slice(0, 80)}`).join("\n");
  }
}

const calcWidthAndHeight = (str: string, single = false) => {
  if (!str) return { width: 45, height: 45 };

  const dummyElement = document.createElement("div");

  dummyElement.style.whiteSpace = single ? "nowrap" : "pre-wrap";
  dummyElement.innerHTML = str;
  dummyElement.style.fontSize = "10px";
  dummyElement.style.width = "fit-content";
  dummyElement.style.height = "fit-content";
  dummyElement.style.padding = "10px";
  dummyElement.style.fontWeight = "500";
  dummyElement.style.overflowWrap = "break-word";
  dummyElement.style.fontFamily = "Menlo, monospace";
  dummyElement.style.lineHeight = "1.5";
  document.body.appendChild(dummyElement);

  const clientRect = dummyElement.getBoundingClientRect();

  const width = clientRect.width + 4;
  const height = clientRect.height;

  document.body.removeChild(dummyElement);

  return {
    width,
    height
  }
}

const sizeCache = new Map<Text, Size>()

// clear cache every 2 mins
setInterval(() => sizeCache.clear(), 120_000);

export const calcNodeSize = (text: Text, isParent = false) => {
  const { compactNodes, disableImagePreview } = useExternal.getState();
  const isImage = isContentImage(text) && !disableImagePreview;

  const cacheKey = [text, isParent, compactNodes].toString();

  // check cache if data already exists
  if (sizeCache.has(cacheKey)) {
    const size = sizeCache.get(cacheKey);

    if (size) return size;
  }

  const lines = calcLines(text);
  const sizes = calcWidthAndHeight(lines, typeof text === "string");

  if (isImage) {
    sizes.width = 80;
    sizes.height = 80;
  }

  if (compactNodes) sizes.width = 300;
  if (isParent && compactNodes) sizes.width = 170;
  if (isParent) sizes.width += 100;
  if (sizes.width > 700) sizes.width = 700;

  sizeCache.set(cacheKey, sizes);
  return sizes;
};
