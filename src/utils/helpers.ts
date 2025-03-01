import {
  ImageRefSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";
import { Project } from "../pages/Projects";
import dayjs from "dayjs";

export type MediaRef = ImageRefSchema | VideoRefSchema | null;

function isVideo(media: MediaRef | null): media is VideoRefSchema {
  return media?.mediaType === "VIDEO";
}
function isImage(media: MediaRef | null): media is ImageRefSchema {
  return media?.mediaType === "IMAGE";
}
function isUpcoming(project: Project) {
  if (!project.start_date) return false;

  const currentDate = new Date();

  const { year = 0, month = 0, day = 0, time = "00:00" } = project.start_date;

  const [hours, minutes] = time.split(":").map(Number);

  const projectStartDate = new Date(year, month, day, hours || 0, minutes || 0);

  return projectStartDate > currentDate;
}

function isExpired(project: Project) {
  if (!project.end_date) return false; // If no end_date, project can't be expired

  const currentDate = new Date();

  const { year = 0, month = 0, day = 0, time = "00:00" } = project.end_date;

  const [hours, minutes] = time.split(":").map(Number);

  const projectEndDate = new Date(year, month, day, hours || 0, minutes || 0);

  return projectEndDate < currentDate;
}

function isCurrent(project: Project) {
  // Ensure project.start_date is defined
  if (!project.start_date) return false;

  const currentDate = new Date();

  const { year = 0, month = 0, day = 0 } = project.start_date;

  // Create a date object for the project's start date
  const projectStartDate = new Date(year, month, day);

  // Get the current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Check if the project is happening in the current month and year
  return (
    projectStartDate.getFullYear() === currentYear &&
    projectStartDate.getMonth() === currentMonth
  );
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

function isMobile() {
  return window.innerWidth < 768;
}

export {
  isVideo,
  isImage,
  isUpcoming,
  isExpired,
  isCurrent,
  parseDate,
  isMobile,
};
