import { requireAuth, signOut } from "../auth/actions";

const Dashboard = async () => {
  const user = await requireAuth();
  async function handleLogout() {
    await signOut();
  }
  return (
    <>
      <div>Dashboard</div>
      <p>Welcome {user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Dashboard;
