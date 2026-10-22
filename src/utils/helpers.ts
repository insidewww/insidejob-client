import type { Project } from "../lib/content.types";
import dayjs from "dayjs";

function isUpcoming(project: Project, currentDate = new Date()) {
  if (!project.start_date) return false;


  const { year = 0, month = 0, day = 0, time = "00:00" } = project.start_date;

  const [hours, minutes] = time.split(":").map(Number);

  const projectStartDate = new Date(year, month, day, hours || 0, minutes || 0);

  return projectStartDate > currentDate;
}

function isExpired(project: Project, currentDate = new Date()) {
  if (!project.end_date) return false; // If no end_date, project can't be expired


  const { year = 0, month = 0, day = 0, time = "00:00" } = project.end_date;

  const [hours, minutes] = time.split(":").map(Number);

  const projectEndDate = new Date(year, month, day, hours || 0, minutes || 0);

  return projectEndDate < currentDate;
}

function parseDate(dateObj: { [k: string]: unknown } | null | undefined) {
  if (!dateObj) return "";

  const { year, month, day, time } = dateObj;

  // Check if the month and year are valid
  const formattedMonth =
    month !== null && month !== undefined
      ? dayjs()
          .set("month", month as number)
          .format("MMMM")
      : "";

  // Build the formatted date string
  const formattedDay = day ? `${day} ` : "";
  const formattedYear = year ? ` ${year}` : "";
  const formattedTime = time ? `, ${time}` : "";

  // Return the formatted date string
  return `${formattedDay}${formattedMonth}${formattedYear}${formattedTime}`;
}

export {
  isUpcoming,
  isExpired,
  parseDate,
};
