import { LinkContainer } from "react-router-bootstrap";
import { FaTimes } from "react-icons/fa";
import { Table, Button } from "react-bootstrap";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetOrdersQuery } from "../../slices/ordersApiSlice";

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      <h1>Orders</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          className="table-sm"
          style={{
            margin: "0 auto",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                  {order._id}
                </td>
                <td>{order.user && order.user.name}</td>
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
                <td>${order.totalPrice}</td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "middle",
                    whiteSpace: "pre-line",
                  }}
                >
                  {order.isPaid ? (
                    new Date(order.paidAt).toLocaleString().replace(",", ",\n")
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
    </>
  );
};
export default OrderListScreen;
