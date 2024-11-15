import { Button } from "react-bootstrap";

const PortfolioButton = ({ url }: { url?: string | null }) => {
  function handleClick() {
    if (url) {
      // If a portfolio PDF URL is available, open it in a new tab
      window.open(url, "_blank");
    } else {
      // If no PDF is available, navigate to the contact tab
      window.open(
        "mailto:insidejob.www@gmail.com?subject=Portfolio%20Request",
        "_blank"
      );
    }
  }

  return (
    <Button onClick={handleClick} variant="insidejob">
      {url ? "Download (PDF)" : "Request PDF"}
    </Button>
  );
};

export default PortfolioButton;
