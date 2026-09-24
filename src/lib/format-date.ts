const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

/** Keep content calendar dates consistent across server and browser timezones. */
export function formatDate(date: string | Date) {
  return dateFormatter
    .format(typeof date === "string" ? new Date(date) : date)
    .replaceAll("/", ".")
}
