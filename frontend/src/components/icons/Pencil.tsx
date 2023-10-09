import type { SVGProps } from "react";

const SvgPencil = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    stroke="#000"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m14 2 4 4L7 17H3v-4L14 2zM3 22h18" />
  </svg>
);

export default SvgPencil;
