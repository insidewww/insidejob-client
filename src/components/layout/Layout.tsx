import { ReactNode } from "react";
import { Row } from "react-bootstrap";
import SiteMetadata, { type MetadataProps } from "../SiteMetadata";
import { useIsMobile } from "../../lib/useIsMobile";

export default function Layout({
  children,
  title,
  description,
  image,
  canonical,
  article,
  metadataTitle,
}: MetadataProps & {
  children: ReactNode;
  title?: string;
  metadataTitle?: string;
}) {
  const isMobile = useIsMobile();
  // Allow long single pages to scroll; ensure the flex child can shrink.
  const singlePageContentClass = "overflow-auto h-100 flex-grow-1 min-vh-0";
  const singlePageContentMobileClass =
    "overflow-auto h-100 flex-grow-1 gap-2 min-vh-0";

  return (
    <>
      <SiteMetadata title={metadataTitle || title} description={description} image={image} canonical={canonical} article={article} />
      <Row id="SinglePageHeader" className="justify-content-center">
        {title && (
          <h6 className="text-center pb-3 font-insidejob-ext">{title}</h6>
        )}
      </Row>
      <Row
        id="SinglePageContent"
        className={
          isMobile ? singlePageContentMobileClass : singlePageContentClass
        }
      >
        {children}
      </Row>
      <Row id="SinglePageFooter"></Row>
    </>
  );
}
