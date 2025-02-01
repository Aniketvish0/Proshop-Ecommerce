import { Alert } from "react-bootstrap";

/* eslint-disable react/prop-types */
const Message = ({ variant, children }) => {
  return <Alert variant={variant}>{children} </Alert>;
};

Message.DefaultProps = {
  variant: "info",
};

export default Message;
