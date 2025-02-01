import { Spinner } from "react-bootstrap";

const Loader = ({ fullPage = true }) => {
  const spinnerStyle = {
    width: "100px",
    height: "100px",
    color: "#7b8a8b",
  };

  if (fullPage) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" role="status" style={spinnerStyle} />
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-3">
      <Spinner animation="border" role="status" style={spinnerStyle} />
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default Loader;
