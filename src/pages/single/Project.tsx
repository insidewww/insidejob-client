import { useLoaderData } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import { Project as ProjectSchema } from "../Projects";
import { Link } from "react-router-dom";
import WorkCard from "../../components/WorkCard";
import HTMLReactParser from "html-react-parser/lib/index";
import Layout from "../../components/layout/Layout.";
import MediaComponent from "../../components/Media";
import { isMobile, parseDate } from "../../utils/helpers";
import { Work } from "../Works";
import { TagSchema } from "@jakubkanna/labguy-front-schema";

export default function Project() {
  const data = useLoaderData() as ProjectSchema;

  if (!data) return null;

  const {
    general,
    subtitle,
    start_date,
    end_date,
    venue,
    urls,
    media,
    ProjectsOnWorks,
    text,
  } = data;

  if (!general.published) return "This page is private.";

  const formattedStartDate = parseDate(start_date);
  const formattedEndDate = parseDate(end_date);
  const works = (ProjectsOnWorks as { work: Work }[]).map((pow) => pow.work);
  const colClass = isMobile() ? "" : "mh-100 d-flex flex-column overflow-auto";
  const isExhibitionView = (tags: TagSchema[]) =>
    tags && tags.find((tag) => tag.title === "EXHIBITION VIEW");

  return (
    <Layout>
      <>
        <Col xs={12} md={6} className={colClass}>
          <h1 className="display-2">{general.title}</h1>
          <div className="px-3">
            <small>
              {general.tags?.map((tag: TagSchema) => `[${tag.title}] `)}
            </small>
            <div className="d-flex flex-column pt-3 h-100">
              {formattedStartDate && (
                <p>
                  {formattedStartDate}{" "}
                  {formattedEndDate ? "- " + formattedEndDate : "- N/A"}
                </p>
              )}
              {subtitle && <>{HTMLReactParser(subtitle)} </>}
              {venue && <p>{venue}</p>}
              {works && works.length > 0 && (
                <p>
                  <span>Works: </span>
                  {works
                    .filter(
                      (w) => !isExhibitionView(w.general.tags as TagSchema[])
                    )
                    .map((w, index, filteredWorks) => (
                      <Link to={`works/${w.general.slug}`}>
                        <span key={w.general.slug}>
                          {w.general.title}
                          {index < filteredWorks.length - 1 && <span>, </span>}
                        </span>
                      </Link>
                    ))}
                </p>
              )}
              <div className={isMobile() ? "p-1" : "p-3"}>
                {text && <>{HTMLReactParser(text as string)}</>}
              </div>

              <div className="d-flex mt-auto align-items-center ">
                {urls.length > 0 && <span>Links: </span>}
                {urls && urls.length > 0 ? (
                  urls.map((url, index) => (
                    <span key={url.id}>
                      <Link to={url.url} target="_blank">
                        {url.title}
                      </Link>
                      {index < urls.length - 1 && <span>, </span>}
                    </span>
                  ))
                ) : (
                  <p></p>
                )}
              </div>
              <Link to="/projects" className="mt-4 me-2">
                <Button variant="insidejob">
                  <i className="bi bi-arrow-left-short"></i> Back
                </Button>
              </Link>
            </div>
          </div>
        </Col>
        <Col xs={12} md={6} className={colClass}>
          {/* Render project media */}
          {media.length > 0 && (
            <Row className="">
              <Col xs={12}>
                <MediaComponent media={media} linkImg />
              </Col>
            </Row>
          )}

          {/* Works section */}
          <Row className="">
            {works && works.length > 0 ? (
              works.map((w) => (
                <Col xs={12} key={w.id}>
                  <WorkCard work={w} />
                </Col>
              ))
            ) : (
              <p></p>
            )}
          </Row>
        </Col>
      </>
    </Layout>
  );
}
