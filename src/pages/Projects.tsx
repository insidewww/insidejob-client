import { useLoaderData, useParams, Outlet } from "react-router-dom";
import {
  GeneralSectionSchema,
  ImageRefSchema,
  ProjectSchema,
  TagSchema,
  UrlSchema,
} from "@jakubkanna/labguy-front-schema";
import { Col, Row } from "react-bootstrap";
import { Work } from "./Works";
import { MediaRef, isImage, isMobile } from "../utils/helpers"; // Assuming isImage is imported here
import Layout from "../components/layout/Layout.";
import Image from "../components/Image";
import { useState } from "react";
import { Link } from "react-router-dom";

export interface Project extends ProjectSchema {
  general: GeneralSectionSchema & { tags: TagSchema[] };
  media: MediaRef[];
  urls: UrlSchema[];
  works: Work[];
}
function getFirstImage(project: Project) {
  return project.media?.find(isImage);
}

export default function Projects() {
  const projects = useLoaderData() as Project[];
  const { slug } = useParams();
  const [preview, setPreview] = useState<ImageRefSchema | null>(
    getFirstImage(projects[0]) || null
  );

  if (!projects) return null;
  const isPublic = (proj: Project) => proj.general.published;

  // Extract unique years from projects where `end_date.year` is defined
  const projectYears = Array.from(
    new Set(
      projects
        .filter((project) => isPublic(project)) // Filter only public projects
        .map((project) => project.end_date?.year) // Map to end_date.year
        .filter(Boolean) // Remove undefined or null values
    )
  ).sort((a, b) => (b || 0) - (a || 0)); // Sort years descending

  // Function to filter projects by specific year
  const getProjectsByYear = (year: number) =>
    projects.filter((project) => project.end_date?.year === year);

  // Group (by year) of projects
  const ProjectsGroup = ({
    year,
    projectsByYear,
  }: {
    year: number;
    projectsByYear: Project[];
  }) => (
    <>
      <Row>
        <Col className="text-end">{year}</Col>
      </Row>
      <Row>
        {projectsByYear.map(
          (proj) =>
            isPublic(proj) && <ProjectsListItem key={proj.id} project={proj} />
        )}
      </Row>
    </>
  );

  // List of projects
  const ProjectsListItem = ({ project }: { project: Project }) => {
    // Find the first image in project.media
    const firstImage = getFirstImage(project);

    return (
      <Row
        className="my-2"
        onMouseEnter={() => firstImage && setPreview(firstImage)}
      >
        <Col>
          <Link to={"/projects/" + project.general.slug}>
            {project.general.title}
          </Link>
        </Col>
      </Row>
    );
  };

  return (
    <>
      {slug ? (
        <Outlet />
      ) : (
        <Layout title="Projects">
          <Col xs={12} md={6} className="d-flex flex-column mh-100 px-md-5">
            <Row>
              <h6 className="text-center font-insidejob-ext">
                Selected Projects
              </h6>
            </Row>
            <Row className="my-2">
              <Col>
                <span>Name</span>
              </Col>
              <Col className="text-end">
                <span>Year</span>
              </Col>
            </Row>
            <Row className="flex-grow-1 overflow-auto">
              <Col className="d-flex flex-column justify-content-end ">
                {projectYears.map((year) => (
                  <ProjectsGroup
                    key={year}
                    year={year!}
                    projectsByYear={getProjectsByYear(year!)}
                  />
                ))}
              </Col>
            </Row>
          </Col>
          {!isMobile() && (
            <Col xs={12} md={6} className="mh-100 ">
              {preview && (
                <Image
                  imageref={preview}
                  className="object-fit-cover h-100 w-100"
                />
              )}
            </Col>
          )}
        </Layout>
      )}
    </>
  );
}
