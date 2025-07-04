import SelectDropdown from './dropdowns/z_select';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Bar as RechartsBar
} from "recharts";

const SubjectWiseAnalysisChart = ({
  groupedBarData = [],
  selectedTest,
  setSelectedTest,
  testData = {},
}: {
  groupedBarData?: any[];
  selectedTest?: string;
  setSelectedTest?: (test: string) => void;
  testData?: Record<string, any>;
}) => {
  // Only keep logic needed for dropdown
  const testList = Object.keys(testData);

  return (
    <div>
      {/* Only show dropdown if testList and setSelectedTest are provided */}
      {testList.length > 0 && setSelectedTest && selectedTest !== undefined && (
        <div className="flex items-center gap-3 w-full sm:w-auto mb-4">
          <label className="text-sm text-gray-400">Test</label>
          <SelectDropdown
            options={testList.map(test => ({ value: test, label: test }))}
            selectedValue={selectedTest}
            onSelect={val => setSelectedTest && typeof val === "string" && setSelectedTest(val)}
            buttonClassName="btn btn-sm justify-between w-full sm:w-48 truncate"
          />
        </div>
      )}
      {/* Chart container */}
      {groupedBarData && groupedBarData.length > 0 && (
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 flex flex-col items-center mt-1">
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupedBarData}
                margin={{ top: 50, right: 30, left: 0, bottom: 30 }}
                barCategoryGap={20}
              >
                <text x="50%" y={24} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold" fill="#15803d">
                  Subject-wise Change
                </text>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <RechartsLegend verticalAlign="top" height={36} />
                <RechartsBar dataKey="Improved" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <RechartsBar dataKey="Declined" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                <RechartsBar dataKey="NoChange" fill="#93c5fd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectWiseAnalysisChart;
