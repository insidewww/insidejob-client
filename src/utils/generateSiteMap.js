import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath to convert URL to path
import dotenv from "dotenv";
dotenv.config();

// Static routes (no dynamic slugs)
const staticRoutes = [
  "/",
  "/bio",
  "/contact",
  "/calendar",
  "/works",
  "/projects",
];

// Assuming you have a function to fetch dynamic slugs for posts, projects, etc.
const fetchSlugs = async (routeType) => {
  const apiUrl = process.env.VITE_SERVER_API_URL;

  // Ensure the API URL is defined
  if (!apiUrl) {
    throw new Error(
      "VITE_SERVER_API_URL is not defined in environment variables"
    );
  }

  try {
    // Define the endpoint for fetching general sections
    const endpoint = `${apiUrl}/general`;

    // Perform the fetch request
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the expected response content type
      },
    });

    // Check if the response is okay (status 200-299)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from ${endpoint}: ${response.statusText}`
      );
    }

    // Parse the response JSON
    const data = await response.json();

    // Filter by the specified routeType and extract slugs
    const slugs = data
      .filter((item) => item[routeType]) // Check if the routeType key exists in the item
      .map((item) => item.slug); // Extract the slug property

    return slugs;
  } catch (error) {
    console.error("Error fetching slugs:", error);
    return []; // Return an empty array on error
  }
};

// Function to generate the sitemap XML
const generateSitemap = async () => {
  // Get dynamic slugs
  const postSlugs = await fetchSlugs("post");
  const projectSlugs = await fetchSlugs("project");
  const workSlugs = await fetchSlugs("work");

  // Get the base URL from environment variables
  const baseUrl = process.env.BASE_URL;

  // Start sitemap structure
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticRoutes.forEach((route) => {
    sitemap += `  <url>\n    <loc>${baseUrl}${route}</loc>\n  </url>\n`;
  });

  // Add dynamic routes for posts
  postSlugs.forEach((slug) => {
    sitemap += `  <url>\n    <loc>${baseUrl}/${slug}</loc>\n  </url>\n`;
  });

  // Add dynamic routes for projects
  projectSlugs.forEach((slug) => {
    sitemap += `  <url>\n    <loc>${baseUrl}/projects/${slug}</loc>\n  </url>\n`;
  });

  // Add dynamic routes for works
  workSlugs.forEach((slug) => {
    sitemap += `  <url>\n    <loc>${baseUrl}/works/${slug}</loc>\n  </url>\n`;
  });

  // Close URL set
  sitemap += "</urlset>\n";

  // Get the current directory path using import.meta.url (ES Module way)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Write the sitemap to a file
  fs.writeFileSync(
    path.join(__dirname, "../../", "public", "sitemap.xml"),
    sitemap
  );
  console.log("Sitemap generated: " + "public/sitemap.xml");
};

// Call the function to generate the sitemap
generateSitemap();
