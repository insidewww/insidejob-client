import { Button, Container } from 'react-bootstrap';
import { Link, isRouteErrorResponse, useRevalidator, useRouteError } from 'react-router-dom';
import Layout from './layout/Layout';
import NotFoundPage from '../pages/404';

export default function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  return <Container><Layout metadataTitle="Content unavailable">
    <div className="position-fixed top-50 start-50 translate-middle text-center">
      <p role="alert">Content could not be loaded. Please try again.</p>
      <Button variant="insidejob" onClick={() => revalidator.revalidate()} disabled={revalidator.state !== 'idle'}>Try again</Button>
      <Link to="/" className="d-block mt-3">Home</Link>
    </div>
  </Layout></Container>;
}
