import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface RankingListProps {
  title: string;
  data: { label: string; val: number }[];
  highlight?: (item: { label: string; val: number }) => boolean;
  onClickItem?: (item: { label: string; val: number }) => void;
  subject?: string;
}

const RankingList: React.FC<RankingListProps> = ({ title, data, highlight, onClickItem, subject }) => (
  <div>
    <div className="font-semibold text-blue-700 mb-2">{title}{subject ? ` – ${subject}` : ""}</div>
    <ScrollArea className="h-44 pr-2">
      {data.map((e) => (
        <div
          key={e.label}
          className={`flex items-center justify-between py-1 border-b border-blue-50 last:border-b-0 transition-all duration-200 hover:bg-blue-50 rounded-lg px-2 ${highlight && highlight(e) ? "bg-red-100" : ""}`}
          onClick={() => onClickItem && onClickItem(e)}
          style={{ cursor: onClickItem ? "pointer" : undefined }}
        >
          <span className="text-blue-900 font-medium">{e.label}</span>
          <Badge className="bg-blue-100 text-blue-700 font-semibold px-2 shadow-sm">{e.val.toFixed ? e.val.toFixed(1) : e.val}</Badge>
        </div>
      ))}
    </ScrollArea>
  </div>
);

export default RankingList;
