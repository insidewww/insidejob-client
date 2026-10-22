import { useLoaderData } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import type { PageContent } from '../../lib/content.types';
import Layout from '../../components/layout/Layout';
import PortfolioButton from '../../components/PortfolioButton';
import WordPressContent from '../../components/wordpress/WordPressContent';
export default function Contact() {
  const page = useLoaderData() as PageContent;
  return <>
    <Layout title={page.title} description={page.description} image={page.image} canonical="https://ulalucinska.com/contact"><Container className="d-flex flex-column justify-content-center">
      <WordPressContent html={page.html} />
      {typeof page.acf.portfolio_pdf === 'string' && page.acf.portfolio_pdf && <div id="Portfolio" className="position-absolute bottom-0 end-0 p-5"><PortfolioButton url={page.acf.portfolio_pdf} /></div>}
    </Container></Layout>
  </>;
}
