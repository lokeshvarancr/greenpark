import React from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DashboardCard = ({ title, value, icon, content, onClick, className = "" }: DashboardCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3 mb-2">
      {icon && <span className="text-blue-600 text-xl">{icon}</span>}
      <span className="text-base font-semibold text-gray-700">{title}</span>
    </div>
    {value && <span className="text-2xl font-bold text-blue-700">{value}</span>}
    {content}
  </motion.div>
);

export default DashboardCard;
