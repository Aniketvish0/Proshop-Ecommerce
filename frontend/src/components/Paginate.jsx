import { Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";

const Paginate = ({ pages, page, isAdmin = false, keyword = "" }) => {
  return (
    pages > 1 && (
      <div
        className="paginateContainer"
        style={{
          display: "grid",
          justifyContent: "center",
          marginTop: "3rem",
          // alignContent: "end",
          // justifyContent: "center",
          // paddingBottom: "2rem",
          // position: "absolute",
          // bottom: "6rem",
          // left: "50%",
          // transform: "translateX(-50%)",
        }}
      >
        <Pagination>
          {[...Array(pages).keys()].map((x) => (
            <Pagination.Item
              as={Link}
              key={x + 1}
              to={
                !isAdmin
                  ? keyword
                    ? `/search/${keyword}/page/${x + 1}`
                    : `/page/${x + 1}`
                  : `/admin/productList/${x + 1}`
              }
              active={x + 1 === page}
            >
              {x + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    )
  );
};

export default Paginate;
