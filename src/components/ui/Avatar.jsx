/**
 * Avatar component showing user initials or image
 * @param {Object} props
 * @param {string} props.name - User name for initials
 * @param {string} [props.src] - Image source URL
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Avatar size
 * @param {string} [props.className] - Additional classes
 * @param {'primary'|'secondary'|'accent'} [props.color='primary'] - Background color for initials
 */
function Avatar({ name, src, size = "md", className = "", color = "primary" }) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-20 h-20 text-2xl",
  };

  const colorMap = {
    primary: "bg-brand-primary",
    secondary: "bg-brand-secondary",
    accent: "bg-brand-accent",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeMap[size]} rounded-full
        ${colorMap[color]}
        flex items-center justify-center
        text-white font-semibold
        ${className}
      `.trim()}
      aria-label={name || "User avatar"}
    >
      {initials}
    </div>
  );
}

export default Avatar;
