import { useState, useEffect } from "react";
import { Table, Form, Button, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { FaTimes } from "react-icons/fa";
import { useProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo, userInfo.name, userInfo.email]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
        }).unwrap();

        dispatch(setCredentials(res));
        toast.success("Profile Updated Successfully");
      } catch (error) {
        toast.error(error?.data?.message || error?.message || error.error);
      }
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="Email" className="my-2">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="Password" className="my-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="my-2">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>

            <Button
              type="submit"
              variant="primary"
              className="my-2 w-100 font-bold"
            >
              Update
            </Button>
            {loadingUpdateProfile && <Loader fullPage={false} />}
          </Form.Group>
        </Form>
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error?.message || error.error}
          </Message>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className="table-sm"
            style={{
              width: "120%",
              margin: "0 auto",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th style={{ width: "30%" }}>Product Details</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th></th>
              </tr>
              <tr>
                <th colSpan="0"></th>
                <th colSpan="1"></th>
                <th>
                  <div
                    style={{ display: "flex", justifyContent: "space-around" }}
                  >
                    <span>Image</span>
                    <span>Name</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Tax</span>
                  </div>
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th colSpan="3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    {order._id}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      whiteSpace: "pre-line", // This allows line breaks
                    }}
                  >
                    {new Date(order.createdAt)
                      .toLocaleString()
                      .replace(",", ",\n")}
                  </td>

                  <td>
                    <ul
                      style={{
                        listStyle: "none",
                        margin: "1rem 0.5rem",
                        padding: "0",
                      }}
                    >
                      {order.orderItems.map((item) => (
                        <li
                          key={item._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              marginRight: "10px",
                            }}
                            title={item.name}
                          />
                          <span
                            style={{
                              width: "100px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={item.name}
                          >
                            {item.name}
                          </span>
                          <span>{item.qty}</span>
                          <span> x </span>
                          <span>${item.price.toFixed(2)}</span>
                          <span> + </span>
                          <span>${order.taxPrice.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "0 0.5rem",
                    }}
                  >
                    {order.totalPrice}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {order.isPaid ? (
                      new Date(order.paidAt)
                        .toLocaleString()
                        .replace(",", ",\n")
                    ) : (
                      <FaTimes style={{ color: "red" }} />
                    )}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {order.isDelivered ? (
                      new Date(order.deliveredAt)
                        .toLocaleString()
                        .replace(",", ",\n")
                    ) : (
                      <FaTimes style={{ color: "red" }} />
                    )}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "0 1rem",
                    }}
                  >
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button className="btn-sm" variant="light">
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};
export default ProfileScreen;
