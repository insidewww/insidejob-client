import { useRouteLoaderData } from 'react-router-dom';
import type { SiteData } from './content.types';
export function useSite() { return (useRouteLoaderData('site') as SiteData | undefined) || { preferences: null, site: null }; }
