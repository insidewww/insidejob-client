import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import Homepage from './pages/single/Home';
import Bio from './pages/single/Bio';
import Contact from './pages/single/Contact';
import Projects from './pages/Projects';
import Post from './pages/single/Post';
import Project from './pages/single/Project';
import NotFoundPage from './pages/404';
import Calendar from './pages/single/Calendar';
import { loadCalendar, loadContent, loadPage, loadProject, loadProjects, loadSite } from './lib/wordpress';
import LoadingPage from './pages/Loading';
import RouteError from './components/RouteError';
const router = createBrowserRouter([{
  id: 'site', path: '/', element: <App />, errorElement: <RouteError />,
  HydrateFallback: LoadingPage,
  loader: ({ request }) => loadSite(request.signal),
  children: [
    { index: true, element: <Homepage /> },
    { path: 'calendar', element: <Calendar />, loader: ({ request }) => loadCalendar(request.signal) },
    { path: 'bio', element: <Bio />, loader: ({ request }) => loadPage('bio', request.signal) },
    { path: 'contact', element: <Contact />, loader: ({ request }) => loadPage('contact', request.signal) },
    { path: 'projects', element: <Projects />, loader: ({ request }) => loadProjects(request.signal) },
    { path: 'projects/:slug', element: <Project />, loader: ({ params, request }) => loadProject(params.slug!, request.signal) },
    { path: 'posts/:slug', element: <Post />, loader: ({ params, request }) => loadContent(params.slug!, request.signal) },
    { path: ':slug', element: <Post />, loader: ({ params, request }) => loadContent(params.slug!, request.signal) },
    { path: '*', element: <NotFoundPage /> },
  ],
}]);
export default function Router() { return <RouterProvider router={router} />; }
