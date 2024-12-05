import HTMLReactParser from "html-react-parser/lib/index";
import Layout from "../../components/layout/Layout.";
import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import { useLoaderData } from "react-router-dom";
import { Col, Accordion } from "react-bootstrap";
import Image from "../../components/Image";
import { isMobile } from "../../utils/helpers";

export default function Bio() {
  const data = (useLoaderData() as ProfileSchema) || null;

  if (!data) return null;

  const { statement, additional, picture } = data;

  const arrayToHtml = (arr: unknown) => {
    const array = Array.isArray(arr) ? arr : [];

    return (
      <Accordion className="accordion-insidejob">
        {array.map((item, index) => {
          // Default title if <h3> is not found
          let title = `Section ${index + 1}`;
          let modifiedHtml = item?.html || "";

          if (item?.html) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = item.html;

            // Find and extract title from <h3>
            const h3 = tempDiv.querySelector("h3");
            if (h3) {
              title = h3.textContent || title;
              h3.remove(); // Remove the <h3> element from tempDiv
            }

            // Get the modified HTML without the <h3>
            modifiedHtml = tempDiv.innerHTML;
          }

          return (
            <Accordion.Item eventKey={String(index)} key={index}>
              <Accordion.Header className="font-insidejob-ext">
                {title}
              </Accordion.Header>
              <Accordion.Body>{HTMLReactParser(modifiedHtml)}</Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  };

  const colClass = isMobile() ? "" : "mh-100 d-flex flex-column";

  return (
    <Layout title="Bio" description={statement || undefined}>
      <Col xs={12} md={6} className={colClass}>
        <div className="h-100 overflow-auto px-md-5">
          {picture && <Image imageref={picture} className="img-fluid pb-4" />}
          {statement && HTMLReactParser(statement)}
        </div>
      </Col>
      <Col xs={12} md={6} className={colClass}>
        <div className="h-100 d-flex flex-column overflow-auto px-md-5">
          <div className="my-auto">{arrayToHtml(additional)}</div>
        </div>
      </Col>
    </Layout>
  );
}
