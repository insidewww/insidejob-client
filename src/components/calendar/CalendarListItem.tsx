import { Project } from "../../pages/Projects";
import { TagSchema, UrlSchema } from "@jakubkanna/labguy-front-schema";
import { parseDate } from "../../utils/helpers";
import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";

export default function CalendarListItem({ project }: { project: Project }) {
  const { general, subtitle, start_date, end_date, venue, urls } = project;

  function displayDate(
    start_date?: Project["start_date"],
    end_date?: Project["end_date"]
  ) {
    if (!start_date && !end_date) return;

    const formattedStartDate = parseDate(start_date);
    const formattedEndDate = parseDate(end_date);

    return (
      <>
        {formattedStartDate ? formattedStartDate : "N/A"}{" "}
        {formattedEndDate ? "- " + formattedEndDate : "- N/A"}
      </>
    );
  }

  function displayUrls(urls: UrlSchema[]) {
    return (
      <div className="d-flex flex-wrap gap-2">
        {/* Check if the project is published and render the internal link */}
        {general.published && general.slug && (
          <Link to={`/projects/${general.slug}`}>
            <i className="bi bi-link"></i> {/* Internal project link icon */}
          </Link>
        )}

        {/* Render external links */}
        {urls?.map((url) => (
          <span key={url.id}>
            <a href={url.url} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-box-arrow-up-right"></i>{" "}
              {/* External link icon */}
            </a>
          </span>
        ))}
      </div>
    );
  }

  return (
    <Row className="mw-100 py-5">
      <Col className="col-12 text-center">
        <h3>{general.title}</h3>
      </Col>
      <Col className="d-flex gap-2 justify-content-center flex-wrap">
        <span>{general.tags?.map((tag: TagSchema) => `[${tag.title}] `)}</span>
        <span>{subtitle}</span>
        <span>{displayDate(start_date, end_date)}</span>
        <span>{venue}</span>
        <span> {displayUrls(urls)} </span>
      </Col>
    </Row>
  );
}
