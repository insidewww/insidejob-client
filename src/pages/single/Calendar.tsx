import { Col } from "react-bootstrap";
import Layout from "../../components/layout/Layout.";
import { useLoaderData } from "react-router-dom";
import CalendarListItem from "../../components/calendar/CalendarListItem";
import { isExpired, isMobile, isUpcoming } from "../../utils/helpers";
import { Project } from "../Projects";
import { Helmet } from "react-helmet";

export default function Calendar() {
  const projects = useLoaderData() as Project[];

  // Separate projects into current and upcoming
  const currentProjects = projects.filter(
    (project) => !isUpcoming(project) && !isExpired(project)
  );
  const upcomingProjects = projects.filter((project) => isUpcoming(project));

  // styling
  const projectListClass =
    "h-100 overflow-auto d-flex flex-column justify-content-center";
  const projectListMobileClass = `d-flex flex-column justify-content-center`;

  // ProjectList component that maps over projects and returns ProjectDisplay components
  const ProjectList = ({ projects }: { projects: Project[] }) => {
    return (
      <div className={isMobile() ? projectListMobileClass : projectListClass}>
        {projects.map((project) => (
          <CalendarListItem key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://www.michalknychaus.com/calendar" />
      </Helmet>
      <Layout title="Current">
        <>
          <Col xs={12} md={6}>
            <h6 className="text-center font-insidejob-ext">Ongoing</h6>
            <ProjectList projects={currentProjects} />
          </Col>
          <Col xs={12} md={6}>
            <h6 className="text-center font-insidejob-ext">Upcoming</h6>
            <ProjectList projects={upcomingProjects} />
          </Col>
        </>
      </Layout>
    </>
  );
}
