interface BadgeProps {
  status: "info" | "success" | "warning" | "destructive" | "default";
  text: string;
  noFixedHeight?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, text, noFixedHeight = false }) => {
  let className = `${noFixedHeight ? '' : 'h-7'} border inline-flex items-center px-2 py-0.5 text-xs font-semibold `;

  switch (status) {
    case "success":
      className +=
        "rounded-md bg-success-bg border-success-line text-success-text";
      break;
    case "destructive":
      className +=
        "rounded-md bg-alert-bg border-alert-line text-alert-text";
      break;
    case "warning":
      className +=
        "rounded-md bg-alert-bg border-alert-line text-alert-text";
      break;
    case "info":
      className +=
        "rounded-md bg-info-bg-hover border-info-line text-info-text";
      break;
    case "default":
      className +=
        "rounded-md bg-canvas-base border-canvas-line text-canvas-text";
      break;
  }

  return <span className={className}>{text}</span>;
};
