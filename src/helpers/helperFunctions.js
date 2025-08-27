export function capitalize(str) {
  return str
    .split(" ")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
export function formatDate(data) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
export function formatDateNoTime(data) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatRelativeTime(data) {
  const now = new Date();
  const activityDate = new Date(data);
  const diffInMs = now - activityDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  // Less than 2 minutes ago
  if (diffInMinutes < 2) {
    return "Just now";
  }

  // Less than 1 hour ago but more than 2 minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  // Compare calendar dates to determine if it's today or yesterday
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
  
  // Same calendar date (today)
  if (activityDay.getTime() === today.getTime()) {
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      return "Today";
    }
  }

  // Yesterday (previous calendar date)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (activityDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // More than 1 day ago - use the regular formatDate
  return formatDate(data);
}

export function format(str) {
  if (str === "dob") {
    return "Date of Birth";
  }
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
