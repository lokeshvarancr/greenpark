import React from "react";
import type { TopicAnalytics } from "../../../IndividualQuestions";

interface TopicAggregationProps {
  topics: TopicAnalytics[];
}

const TopicAggregation: React.FC<TopicAggregationProps> = ({ topics }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="font-semibold mb-2">Topic-Level Aggregation</h3>
    <ul className="space-y-4">
      {topics.map(topic => (
        <li key={topic.topic} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">{topic.topic}</span>
            <span className="text-sm font-bold">{topic.avgAccuracy.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                topic.avgAccuracy < 40
                  ? "bg-red-400"
                  : topic.avgAccuracy <= 70
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${topic.avgAccuracy}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">{topic.totalQuestions} questions</span>
        </li>
      ))}
    </ul>
  </div>
);

export default TopicAggregation;
