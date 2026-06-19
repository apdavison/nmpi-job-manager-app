import type { ReactNode } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

interface PanelProps {
  children?: ReactNode;
  label?: ReactNode;
  icon?: ReactNode;
  defaultExpanded?: boolean;
}

function Panel(props: PanelProps) {
  const { children, label, icon, defaultExpanded } = props;

  if (children) {
    return (
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls={`${label} panel content`}
          sx={{ backgroundColor: "#e2eee2" }}
        >
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {icon}
            {label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    );
  } else {
    return "";
  }
}

export default Panel;
