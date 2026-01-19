"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Area,
} from "recharts";
import styles from "./styles.module.css";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  CalendarIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  icons,
  ChevronDown,
} from "lucide-react";
import Calendar from "@/components/ui/calendar/calendar";
import SoldSvg from "@/Assets/svgs/SoldSvg";
import CartSvg from "@/Assets/svgs/CartSvg";
import RevenueSvg from "@/Assets/svgs/RevenueSvg";
import ProfitSvg from "@/Assets/svgs/ProfitSvg";
import ChevronUpSvg from "@/Assets/svgs/ChevronUp";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ChevronUp from "@/Assets/svgs/ChevronUp";

// Exact chart data matching the image
const chartData = [
  { month: "Jan", revenue: 1200, profit: 350, amount: "$200" },
  { month: "Feb", revenue: 800, profit: 300, amount: "$400" },
  { month: "Mar", revenue: 900, profit: 400, amount: "$600" },
  { month: "Apr", revenue: 650, profit: 450, amount: "$800" },
  { month: "May", revenue: 700, profit: 400, amount: "$1000" },
  { month: "Jun", revenue: 1200, profit: 388, amount: "$1200" },
  { month: "Jul", revenue: 680, profit: 388, amount: "$680" },
  { month: "Aug", revenue: 650, profit: 375, amount: "$388" },
  { month: "Sep", revenue: 600, profit: 450 },
  { month: "Oct", revenue: 550, profit: 350 },
  { month: "Nov", revenue: 600, profit: 400 },
  { month: "Dec", revenue: 650, profit: 425 },
];

// Add this mini chart data
const miniChartData = [
  { value: 600 },
  { value: 500 },
  { value: 400 },
  { value: 750 },
  { value: 600 },
  { value: 450 },
  { value: 550 },
  { value: 950 },
];

// Add mini chart data with correct values
const miniRevenueData = [
  { value: 600 },
  { value: 550 },
  { value: 450 },
  { value: 500 },
  { value: 550 },
  { value: 600 },
  { value: 350 },
  { value: 500 },
  { value: 550 },
  { value: 600 },
  { value: 350 },
  { value: 500 },
  { value: 550 },
  { value: 600 },
  { value: 650 },
  { value: 700 },
  { value: 750 },
  { value: 800 },
  { value: 750 },
];

const miniProfitData = [
  { value: 200 },
  { value: 250 },
  { value: 500 },
  { value: 450 },
  { value: 600 },
  { value: 450 },
  { value: 700 },
  { value: 550 },
  { value: 600 },
  { value: 850 },
  { value: 900 },
  { value: 1250 },
];

// Type definition for the source data
interface SourceData {
  source: string;
  value: number;
  color: string;
  percentage: number;
}

// Function to calculate rotations and adjusted percentages
const calculateRotations = (data: SourceData[]) => {
  const GAP = 6; // Gap in degrees
  const TOTAL_GAPS = data.length * GAP;
  const AVAILABLE_DEGREES = 360 - TOTAL_GAPS;

  let currentRotation = 0;
  const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);

  return data.map((item) => {
    const rotation = currentRotation;
    // Adjust percentage to account for gaps while maintaining proportions
    const adjustedPercentage =
      (item.percentage / totalPercentage) * 100 * (AVAILABLE_DEGREES / 360);

    currentRotation += (adjustedPercentage / 100) * 360 + GAP;

    return {
      ...item,
      rotation,
      percentage: adjustedPercentage,
    };
  });
};

// Sample API response format (original percentages)
const mockApiResponse = [
  {
    source: "Google Ads",
    value: 10000,
    color: "#009499",
    percentage: 55,
  },
  {
    source: "Facebook Ads",
    value: 4000,
    color: "#F05D3D",
    percentage: 22,
  },
  {
    source: "Twitter",
    value: 2100,
    color: "#6E0AB8",
    percentage: 12,
  },
  {
    source: "Emails",
    value: 1900,
    color: "#E7AA0B",
    percentage: 11,
  },
];

const AnalyticsCard = ({
  title,
  amount,
  percentage,
  change,
  icon = <SoldSvg />,
  graphData,
  graphColor,
  gradientId,
}) => {
  return (
    <Card className="p-[20px] rounded-[20px] bg-white">
      <div className="">
        <div className="flex justify-between items-center">
          <p className={styles.cardTitle}>{title}</p>
          <div>{icon}</div>
        </div>
        <div className="flex items-center justify-between mt-[40px]">
          <div>
            <div className={styles.cardAmount}>{amount}</div>
            <div className="flex items-center gap-2 mt-[20px]">
              <div></div>
              <span className={styles.cardPercentage}>{percentage}</span>
              <ChevronUpSvg />

              {change && <span className={styles.cardChange}>{change}</span>}
            </div>
          </div>
          <div className="h-[72px] w-[30%]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={graphData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={graphColor}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={graphColor}
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  fill={`url(#${gradientId})`}
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={graphColor}
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CustomTooltip = ({ active, payload }) => {
    console.log("ACTIVE", active)
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-md rounded-xl p-3 border border-gray-200">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-[#42DA82]"></span>
            <span className={styles.customTooltipLabel}>Revenue</span>
          </div>
          <span className={styles.customTooltipValue}>${payload[0].value}</span>
          <ChevronUp />
        </div>
        <div className="flex items-center justify-between space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className={styles.customTooltipLabel}>Profit</span>
          </div>
          <span className={styles.customTooltipValue}>${payload[1].value}</span>
          <ChevronUp />
        </div>
      </div>
    );
  }
  return null;
};
export default function AnalyticsPage() {
  // In real implementation, replace with actual API call
  const sourceData = calculateRotations(mockApiResponse);

  return (
    <div className={styles.analyticsContainer}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={styles.header}>Analytics</h1>
        <Calendar />
      </div>

      {/* Top Stats */}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Visa Sold"
          amount="$31,300"
          percentage="5%"
          change="+156"
          icon={<SoldSvg />}
          graphData={miniRevenueData}
          graphColor="#10B981"
          gradientId="revenueGradient"
        />
        <AnalyticsCard
          title="Total Revenue"
          amount="$31,300"
          percentage="5%"
          change="+156"
          icon={<CartSvg />}
          graphData={miniRevenueData}
          graphColor="#019BF4"
          gradientId="revenueGradient"
        />
        <AnalyticsCard
          title="Total Profit"
          amount="$14,210"
          percentage="10%"
          change="+$142"
          icon={<ProfitSvg />}
          graphData={miniProfitData}
          graphColor="#009499"
          gradientId="profitGradient"
        />
      </div>
      {/* Revenue & Profit Chart */}
      <Card className={styles.otherCardsHeadRad}>
        <div>
          <div className={styles.otherCardsHeadContainer}>
            <div>
              <h2 className={styles.otherCardsHead}>Statistic</h2>
              <p className={styles.otherCardsSubHead}>Revenue & Profit</p>
            </div>
            <div className="flex gap-2 items-center ">
              <Calendar />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-[#727A90] flex items-center gap-2 border-[#E9EAEA] rounded-[12px]"
                  >
                    Show All
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem>Option 1</DropdownMenuItem>
                  <DropdownMenuItem>Option 2</DropdownMenuItem>
                  <DropdownMenuItem>Option 3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#D3D6DD"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fill: "#727A90", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#727A90", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={
                  <CustomTooltip active={undefined} payload={undefined} />
                }
                cursor={{ stroke: "#42DA82", strokeWidth: 1 }}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#10B981" }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#EF4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Visa Sold Source */}
      <Card className={styles.otherCardsHeadRad}>
        <div>
          <div className={styles.otherCardsHeadContainer}>
            <div>
              <h2 className={styles.otherCardsHead}>Visa Sold Source</h2>
              <p className={styles.otherCardsSubHead}>Based on Categories</p>
            </div>
            <Calendar />
          </div>

          <div className="flex justify-center">
            <div className="relative w-[260px] h-[260px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={styles.circularProgressInsideHead}>
                    18,120
                  </div>
                  <div className="flex items-center gap-2 mt-[20px]">
                    <div></div>
                    <span className={styles.cardPercentage}>10%</span>
                    <ChevronUpSvg />

                    <span className={styles.cardChange}>+150 today</span>
                  </div>
                </div>
              </div>
              {sourceData.map((item, index) => (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                  }}
                >
                  <CircularProgressbar
                    value={item.percentage}
                    strokeWidth={4}
                    styles={buildStyles({
                      rotation: 0,
                      strokeLinecap: "round",
                      pathColor: item.color,
                      trailColor: "transparent",
                      pathTransition: "stroke-dashoffset 0.5s ease 0s",
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 px-[20px] pb-[20px]">
            {sourceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#727A90] font-[500] text-[14px]">
                    {item.source}
                  </span>
                </div>
                <span className="text-[#24282E] text-[16px] font-[500]">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
