import { Helmet } from "react-helmet-async";

const Meta = ({
  title = "ProShop",
  description = "A MERN stack e-commerce website",
  keywords = "MERN, React, ReactJS, NodeJS, Express, MongoDB, Mongoose",
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

export default Meta;
