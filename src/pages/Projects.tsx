import {
  useLoaderData,
  useParams,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  GeneralSectionSchema,
  ImageRefSchema,
  ProjectSchema,
  TagSchema,
  UrlSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";
import { Button, Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout.";
import Image from "../components/Image";
import { isMobile } from "../utils/helpers";

export interface Project extends ProjectSchema {
  general: GeneralSectionSchema & { tags: TagSchema[] };
  media: (ImageRefSchema | VideoRefSchema)[];
  urls: UrlSchema[];
  works: unknown[];
  cover: ImageRefSchema;
}

export default function Projects() {
  const allProjects = useLoaderData() as Project[];
  const { slug } = useParams();
  const navigate = useNavigate();
  // Consolidated state for preview image and project slug
  const [preview, setPreview] = useState<{
    image: ImageRefSchema | null;
    slug: string | null;
  }>({ image: null, slug: null });

  useEffect(() => {
    // Get the filtered list of published projects
    const filteredProjects = allProjects.filter(
      (proj) => proj.general.published
    );

    if (filteredProjects.length > 0) {
      setPreview({
        image: getFirstImage(filteredProjects[0]) || null,
        slug: filteredProjects[0].general.slug || null,
      });
    } else {
      setPreview({ image: null, slug: null });
    }
  }, [allProjects]); // Trigger the effect when allProjects changes

  if (!allProjects.length) return null;

  // Extract unique years from filteredProjects and sort in descending order
  const filteredProjects = allProjects.filter((proj) => proj.general.published);
  const projectYears = Array.from(
    new Set(
      filteredProjects
        .map((project) => project.end_date?.year ?? 0)
        .filter(Boolean)
    )
  ).sort((a, b) => (b ?? 0) - (a ?? 0));

  const getFirstImage = (project: Project) => project.cover;

  // Group projects by year
  const getProjectsByYear = (year: number) =>
    filteredProjects.filter(
      (project) => project.end_date?.year === (year ?? 0)
    );

  const handleMouseEnter = (proj: Project) => {
    const firstImage = getFirstImage(proj);
    setPreview({
      image: firstImage || null,
      slug: proj.general.slug as string,
    });
  };

  // Group component for a specific year
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
        {projectsByYear.map((proj) => (
          <Col xs={12} key={proj.id}>
            <ProjectsListItem project={proj} />
          </Col>
        ))}
      </Row>
    </>
  );

  // Individual project list item
  const ProjectsListItem = ({ project }: { project: Project }) => {
    const link = `/projects/${project.general.slug}`;
    return (
      <Row className={isMobile() ? "py-2" : ""}>
        <Button
          onMouseEnter={() => handleMouseEnter(project)}
          onMouseDown={() => navigate(link)}
          variant="link"
        >
          <h2 className="font-insidejob"> {project.general.title}</h2>
        </Button>
      </Row>
    );
  };

  return slug ? (
    <Outlet />
  ) : (
    <Layout title="Projects">
      <Col xs={12} md={6} className="d-flex flex-column mh-100 px-md-5">
        <Row>
          <h6 className="text-center font-insidejob-ext">Selected Projects</h6>
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
          <Col className="d-flex flex-column justify-content-end">
            {projectYears.map((year) => (
              <ProjectsGroup
                key={year}
                year={year}
                projectsByYear={getProjectsByYear(year)}
              />
            ))}
          </Col>
        </Row>
      </Col>
      {!isMobile() && preview.image && preview.slug && (
        <Col xs={12} md={6} className="mh-100">
          <Link to={`/projects/${preview.slug || "#"}`}>
            <Image
              key={preview.slug}
              imageref={preview.image}
              className="object-fit-cover h-100 w-100"
            />
          </Link>
        </Col>
      )}
    </Layout>
  );
}
