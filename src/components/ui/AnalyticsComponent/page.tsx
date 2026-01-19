import Calendar from "../calendar/calendar";
import RevenueSvg from "@/Assets/svgs/RevenueSvg";
import Graph1Svg from "@/Assets/svgs/Graph1Svg";
import UserSvg from "@/Assets/svgs/UserSvg";
import Graph2Svg from "@/Assets/svgs/Graph2Svg";
import ApplicationSvg from "@/Assets/svgs/ApplicationSvg";
import styles from "./styles.module.css";
import LeftIconSvg from "@/Assets/svgs/RightIconSvg";
import Graph3Svg from "@/Assets/svgs/Grapg3Svg";

const DashboardCard = ({
  icon: Icon,
  title,
  amount,
  percentage,
  change,
  graph: Graph,
}) => {
  return (
    <div className="border border-gray-300 w-full h-[208px] rounded-2xl bg-white">
      <div className="p-5">
        <div className="flex items-center gap-2">
          <Icon />
          <span className="font-medium text-lg text-gray-500">{title}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900">{amount}</h2>
            <div className="flex gap-4">
              <span className="text-sm font-bold text-teal-600">
                {percentage}
              </span>
              {change && (
                <span className="text-sm font-normal text-gray-500">
                  {change}
                </span>
              )}
            </div>
          </div>
          <Graph />
        </div>
      </div>
      <hr className="my-1" />
      <div className="flex justify-between items-center p-5">
        <span className="text-sm font-semibold text-green-500">See More</span>
        <LeftIconSvg />
      </div>
    </div>
  );
};

export default function AnalyticsComponent() {
  return (
    <div>
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-between w-full py-5">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div>
            <Calendar />
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={RevenueSvg}
          title="Total Revenue"
          amount="$75,000"
          percentage="10%"
          change="+750%"
          graph={Graph1Svg}
        />
        <DashboardCard
          icon={UserSvg}
          title="Total New Customers"
          amount="31,300"
          percentage="5%"
          change="+156"
          graph={Graph2Svg}
        />
        <DashboardCard
          icon={ApplicationSvg}
          title="Applications to Apply"
          amount="26"
          change="+156"
          percentage="10%"
          graph={Graph3Svg}
        />
      </div>
    </div>
  );
}
