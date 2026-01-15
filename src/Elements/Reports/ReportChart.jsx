import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";

const ReportChart = ({ data, chartParams }) => {
  return (
    <div className="report-chart-wrapper">
      <BarChart
        style={{ width: "100%", aspectRatio: 1.618, maxHeight: "45vh" }}
        responsive
        data={data}
      >
        <CartesianGrid strokeDasharray="10 10" />
        <XAxis dataKey={chartParams.XAxis} />
        <YAxis dataKey={chartParams.YAxis} />
        <Bar dataKey={chartParams.Bar} />
        <RechartsDevtools />
      </BarChart>
    </div>
  );
};
export default ReportChart;
