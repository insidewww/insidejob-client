import { Helmet } from 'react-helmet';
import { useSite } from '../lib/useSite';

export interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  article?: boolean;
}

export default function SiteMetadata({ title, description, image, canonical, article = false }: MetadataProps) {
  const { site, preferences } = useSite();
  const name = site?.name || 'Untitled';
  const pageTitle = title?.trim();
  const documentTitle = pageTitle && pageTitle !== name
    ? `${pageTitle} – ${name}` : [name, site?.description].filter(Boolean).join(' – ');
  const summary = description?.trim() || site?.description || '';
  const imageUrl = image || preferences?.homepage_media?.src;
  return <Helmet>
    <title>{documentTitle}</title>
    <meta name="title" content={documentTitle} />
    <meta name="description" content={summary} />
    <meta name="author" content={name} />
    <meta property="og:site_name" content={name} />
    <meta property="og:title" content={documentTitle} />
    <meta property="og:description" content={summary} />
    <meta property="og:type" content={article ? 'article' : 'website'} />
    <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={documentTitle} />
    <meta name="twitter:description" content={summary} />
    {imageUrl && <meta property="og:image" content={imageUrl} />}
    {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    <link rel="icon" href={site?.iconUrl || '/favicon/favicon.ico'} />
    {canonical && <link rel="canonical" href={canonical} />}
    {canonical && <meta property="og:url" content={canonical} />}
  </Helmet>;
}
