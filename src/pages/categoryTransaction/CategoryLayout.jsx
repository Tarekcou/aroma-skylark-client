import { Outlet } from "react-router";

const CategoryLayout = () => {
  return (
    <div className="mt-4">
      <Outlet />
    </div>
  );
};

export default CategoryLayout;
