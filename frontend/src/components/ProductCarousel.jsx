import { Link } from "react-router-dom";
import { Carousel, Image } from "react-bootstrap";
// import Loader from "./Loader";
import Message from "./Message";
import { useGetTopProductsQuery } from "../slices/productApiSlice";

const ProductCarousel = () => {
  const { data: products, error } = useGetTopProductsQuery();

  return error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : products ? (
    <Carousel pause="hover" className="bg-primary mb-4">
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`}>
            <Image src={product.image} alt={product.name} fluid />
          </Link>
          <Carousel.Caption>
            <h2>{product.name}</h2>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  ) : null;
};
export default ProductCarousel;
