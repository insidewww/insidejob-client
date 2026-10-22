import { useLoaderData } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import type { PageContent } from '../../lib/content.types';
import WordPressContent from '../../components/wordpress/WordPressContent';
import Layout from '../../components/layout/Layout';
export default function Post() {
  const data = useLoaderData() as PageContent;
  return <Layout title={data.title} description={data.description} image={data.image} article={data.kind === 'post'}><Container className="d-flex flex-column gap-4"><WordPressContent html={data.html} /></Container></Layout>;
}
