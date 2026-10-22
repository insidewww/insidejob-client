import { Link, useLoaderData } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import type { Project as ProjectContent } from '../../lib/content.types';
import Layout from '../../components/layout/Layout';
import WordPressContent from '../../components/wordpress/WordPressContent';
import { parseDate } from '../../utils/helpers';
import { useIsMobile } from '../../lib/useIsMobile';
import getCanonicalBaseUrl from '../../utils/getCanonicalBaseUrl';
export default function Project() {
  const isMobile = useIsMobile();
  const data = useLoaderData() as ProjectContent;
  const { general, subtitle, start_date, end_date, venue, urls, textHtml, mediaHtml } = data;
  const start = parseDate(start_date); const end = parseDate(end_date);
  const colClass = isMobile ? '' : 'mh-100 d-flex flex-column overflow-auto';
  return <>
    <Layout title={general.title} description={general.description} image={data.cover?.src} canonical={`${getCanonicalBaseUrl(data)}/projects/${general.slug}`} article>
      <Col xs={12} md={6} className={colClass}>
        <h1 className="display-2">{general.title}</h1>
        <div className="px-3">
          <small>{general.tags.map(tag => `[${tag.title}] `)}</small>
          <div className="d-flex flex-column pt-3 h-100">
            {start && <p>{start} {end ? '- ' + end : '- N/A'}</p>}
            {subtitle && <WordPressContent html={subtitle} />}
            {venue && <p>{venue}</p>}
            <div className={isMobile ? 'p-1' : 'p-3'}><WordPressContent html={textHtml} /></div>
            <div className="mt-auto mw-100 text-wrap">
              {urls.length > 0 && <span>Links:&nbsp;</span>}
              <div className="d-inline-block">{urls.map((url, i) => <span key={i}><a href={url.url} target="_blank" rel="noopener noreferrer">{url.title}</a>{i < urls.length - 1 && ', '}</span>)}</div>
            </div>
            <div className="mt-4 me-2"><Link to="/projects" className="btn btn-insidejob"><i className="bi bi-arrow-left-short" /> Back</Link></div>
          </div>
        </div>
      </Col>
      <Col xs={12} md={6} className={colClass}><WordPressContent html={mediaHtml} gallery /></Col>
    </Layout>
  </>;
}
