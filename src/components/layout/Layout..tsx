import { ReactNode, useContext } from "react";
import { Row } from "react-bootstrap";
import { GeneralContext } from "../../contexts/GeneralContext";
import { Helmet } from "react-helmet";
import { isMobile } from "../../utils/helpers";

export default function Layout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const { preferences } = useContext(GeneralContext);

  const metadata = {
    title: title || preferences?.artists_name || "Untitled",
    description: description,
    name: preferences?.artists_name,
  };

  const singlePageContentClass = "overflow-hidden h-100";
  const singlePageContentMobileClass = "overflow-auto h-100 gap-2";

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="title" content={metadata.title} />
        <meta name="description" content={metadata.description} />
        <meta name="author" content={metadata.name} />
      </Helmet>
      <Row id="SinglePageHeader" className="justify-content-center">
        {title && (
          <h6 className="text-center pb-3 font-insidejob-ext">{title}</h6>
        )}
      </Row>
      <Row
        id="SinglePageContent"
        className={
          isMobile() ? singlePageContentMobileClass : singlePageContentClass
        }
      >
        {children}
      </Row>
      <Row id="SinglePageFooter"></Row>
    </>
  );
}
