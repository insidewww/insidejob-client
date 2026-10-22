export interface ImageRefSchema {
  mediaType: 'IMAGE';
  id?: number;
  src: string;
  fullSrc?: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  description?: string;
  width?: number;
  height?: number;
  isBright?: boolean;
}
export interface TagSchema { id: number; title: string }
export interface UrlSchema { id?: number | string; url: string; title: string }
export interface PartialDate { year?: number; month?: number; day?: number; time?: string; [key: string]: unknown }
export interface GeneralSectionSchema { title: string; slug: string; description?: string; published: boolean; createdAt: string; updatedAt?: string; tags: TagSchema[] }
export interface Project {
  id: number;
  general: GeneralSectionSchema;
  start_date: PartialDate | null;
  end_date: PartialDate | null;
  subtitle?: string;
  venue?: string;
  urls: UrlSchema[];
  cover: ImageRefSchema | null;
  inProjects: boolean;
  textHtml: string;
  mediaHtml: string;
}
export interface PageContent { id: number; slug: string; title: string; description: string; image?: string; kind: 'post' | 'page'; html: string; acf: Record<string, unknown> }
export interface Preferences {
  homepage_description?: string;
  homepage_heading?: string;
  homepage_subheading?: string;
  homepage_content?: string;
  homepage_media?: ImageRefSchema;
  homepage_urls: UrlSchema[];
}
export interface SiteSettings { name: string; description: string; iconUrl?: string }
export interface SiteData { preferences: Preferences; site: SiteSettings }
