import { useLoaderData } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import { Project as ProjectSchema } from "../Projects";
import { Link } from "react-router-dom";
import WorkCard from "../../components/WorkCard";
import HTMLReactParser from "html-react-parser/lib/index";
import Layout from "../../components/layout/Layout.";

import MediaComponent from "../../components/Media";
import { parseDate } from "../../utils/helpers";
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

  return (
    <Layout>
      <>
        <Col xs={12} md={6} className="mh-100 d-flex flex-column overflow-auto">
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
                  {works.map((w, index) => (
                    <span key={w.general.slug}>
                      <Link to={`/works/${w.general.slug}`}>
                        {w.general.title}
                      </Link>
                      {index < works.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </p>
              )}
              <div className="p-3 p-md-5">
                {text && <>{HTMLReactParser(text as string)}</>}
              </div>
              <div className="d-flex mt-auto">
                {" "}
                <span>Related:&nbsp;</span>
                <Link to="/projects">All Projects{urls && ","}</Link>
                <span>&nbsp;</span>
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
            </div>
          </div>
        </Col>
        <Col xs={12} md={6} className="mh-100 d-flex flex-column overflow-auto">
          {/* Render project media */}
          <Row className="gap-3">
            <Col xs={12}>
              <MediaComponent media={media} />
            </Col>
          </Row>

          {/* Works section */}
          <Row className="gap-3">
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
