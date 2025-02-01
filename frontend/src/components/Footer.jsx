import { Container, Row, Col } from "react-bootstrap";
// import { useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Paginate from "./Paginate";

const Footer = ({ pages, page, keyword }) => {
  const currentYear = new Date().getFullYear();
  // const location = useLocation();

  // // Get the user info from Redux state
  // const { userInfo } = useSelector((state) => state.auth);

  // const showPaginate =
  //   ["/", "/admin/productList"].includes(location.pathname) ||
  //   location.pathname.startsWith("/page/") ||
  //   location.pathname.startsWith("/admin/productList/");

  // // Check if the user is an admin
  // const isAdmin = userInfo && userInfo.isAdmin;

  return (
    <footer>
      <Container>
        {/* {showPaginate && (
          <Row className="mb-3">
            <Col>
              <Paginate pages={pages} page={page} isAdmin={isAdmin} />
            </Col>
          </Row>
        )} */}
        <Row>
          <Col className="text-center py-3">
            <p>ProShop &copy; {currentYear}</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
