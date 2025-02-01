import { Table, Button } from "react-bootstrap";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useGetUsersQuery,
  useDeleteUsersMutation,
} from "../../slices/usersApiSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUsers, { isDeleting }] = useDeleteUsersMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUsers(id);
        refetch();
        toast.success("User successfully deleted");
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <>
      <h1>Users</h1>
      {isDeleting && <Loader />}
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
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  {user.isAdmin ? (
                    <FaCheck style={{ color: "green", margin: "1rem" }} />
                  ) : (
                    <FaTimes style={{ color: "red", margin: "1rem" }} />
                  )}
                </td>

                <td
                  style={{
                    display: "flex",
                    textAlign: "center",
                    justifyContent: "space-evenly",
                    verticalAlign: "middle",
                    margin: "1rem 0",
                    padding: "0",
                  }}
                >
                  {!user.isAdmin && (
                    <>
                      <Button
                        as={Link}
                        to={`/admin/user/${user._id}/edit`}
                        style={{ marginRight: "10px" }}
                        variant="light"
                        className="btn-sm"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => deleteHandler(user._id)}
                      >
                        <FaTrash style={{ color: "white" }} />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default UserListScreen;
