import { Project as ProjectSchema } from "../pages/Projects";
import { Work as WorkSchema } from "../pages/Works";

/**
 * Generates a canonical base URL based on the day of the `updatedAt` or `createdAt` date.
 *
 * This function determines the canonical base URL depending on whether the day of the
 * month extracted from the `updatedAt` or `createdAt` property of the input data is even or odd.
 *
 * - If the day is even, the URL "https://ulalucinska.com" is returned.
 * - If the day is odd, the URL "https://michalnychaus.com" is returned.
 *
 * If neither `updatedAt` nor `createdAt` is available, a fallback date of `0` (Unix epoch) is used.
 *
 * @param {ProjectSchema} data - The project data object containing `general.updatedAt` and `general.createdAt`.
 * @returns {string} The canonical base URL based on the even or odd day of the relevant date.
 */
export default function getCanonicalBaseUrl(data: ProjectSchema | WorkSchema) {
  //
  const updatedAt = data.general.updatedAt;
  const createdAt = data.general.createdAt;

  // Convert the date string to a Date object
  const date = new Date(updatedAt || createdAt || 0);

  // Get the day of the month
  const day = date.getDate();

  // Check if the day is even or odd
  if (day % 2 === 0) {
    return "https://ulalucinska.com"; //even
  } else {
    return "https://michalnychaus.com";
  }
}
