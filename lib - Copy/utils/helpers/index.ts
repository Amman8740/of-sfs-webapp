export * from './cn';
export * from './get-url';
export * from './post-data';
export * from './to-date-time';
export * from './calculate-trial-end';
export * from './toast-redirect';

export const formatdDateTime = (scheduled_date: string, scheduled_time: string) => {
    if (!scheduled_date || !scheduled_time) return "";
  
    // Create a Date object from date + time (assuming UTC or local as stored)
    const date = new Date(`${scheduled_date}T${scheduled_time}`);
  
    // Format the date: "Thu, 7 Aug 2025"
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  
    // Format the time: "10:00 AM"
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  
    // Combine both into the final format
    return `${formattedDate} (${formattedTime})`;
  }
  