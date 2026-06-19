import { Button } from "@mui/material";

interface FilterButtonProps {
  target: string;
  current: string;
  onClick: (value: string) => void;
}

function FilterButton(props: FilterButtonProps) {
  const { target, current, onClick } = props;

  return (
    <Button
      variant={current === target ? "contained" : "outlined"}
      color={current === target ? "primary" : "inherit"}
      onClick={() => onClick(target)}
    >
      {target}
    </Button>
  );
}

export default FilterButton;
