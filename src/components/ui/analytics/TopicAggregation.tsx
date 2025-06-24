import React from "react";
import type { TopicAnalytics } from "../../../IndividualQuestions";

interface TopicAggregationProps {
  topics: TopicAnalytics[];
}

const TopicAggregation: React.FC<TopicAggregationProps> = ({ topics }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="font-semibold mb-2">Topic-Level Aggregation</h3>
    <ul className="space-y-4">
      <li className="text-gray-400">No topic-level data available.</li>
    </ul>
  </div>
);

export default TopicAggregation;
