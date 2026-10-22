import { useLoaderData } from 'react-router-dom';
import { Accordion, Col } from 'react-bootstrap';
import type { PageContent } from '../../lib/content.types';
import Layout from '../../components/layout/Layout';
import WordPressContent from '../../components/wordpress/WordPressContent';
import { useIsMobile } from '../../lib/useIsMobile';
export default function Bio() {
  const isMobile = useIsMobile();
  const page = useLoaderData() as PageContent;
  const doc = new DOMParser().parseFromString(page.html, 'text/html');
  const intro = doc.querySelector('.insidejob-bio-intro');
  const details = Array.from(doc.querySelectorAll('details'));
  const colClass = isMobile ? '' : 'mh-100 d-flex flex-column';
  return <>
    <Layout title={page.title} description={page.description} image={page.image} canonical="https://www.ulalucinska.com/bio">
      <Col xs={12} md={6} className={colClass}><div className="h-100 overflow-auto px-md-5"><WordPressContent className="bio-intro" html={intro?.innerHTML || page.html} /></div></Col>
      <Col xs={12} md={6} className={colClass}><div className="h-100 d-flex flex-column overflow-auto px-1 px-md-5"><div className="my-auto">
        <Accordion className="accordion-insidejob">{details.map((detail, index) => {
          const summary = detail.querySelector('summary'); const title = summary?.textContent || `Section ${index + 1}`;
          summary?.remove();
          return <Accordion.Item eventKey={String(index)} key={index} className={isMobile ? '' : 'w-75 ms-auto me-auto'}>
            <Accordion.Header className="font-insidejob-ext d-flex justify-content-center py-4"><h2 className="font-insidejob font fs-3">{title}</h2></Accordion.Header>
            <Accordion.Body className="d-flex justify-content-center"><WordPressContent className="d-inline-block" html={detail.innerHTML} /></Accordion.Body>
          </Accordion.Item>;
        })}</Accordion>
      </div></div></Col>
    </Layout>
  </>;
}
