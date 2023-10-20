import { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const Tooltip = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    setTimeout(() => {
      setIsOpen(false);
    }, 9000);
  }, []);

  return (
    <ReactTooltip
      id="helper-tooltip"
      content="Click here to start searching for games to submit to the list"
      isOpen={isOpen}
      variant="info"
      style={{ wordBreak: "break-word", width: "50%" }}
    />
  );
};

export default Tooltip;
