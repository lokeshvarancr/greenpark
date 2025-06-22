// src/styles/dashboardStyles.ts
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area"; // Import Shadcn ScrollArea if needed, though you might rename it
import { Badge } from "@/components/ui/badge"; // Import Shadcn Badge if needed

export const Spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const Colors = {
  // Light Theme Colors
  background: '#F0F2F5', // Light background
  cardBackground: '#FFFFFF', // White card background
  textPrimary: '#333333', // Dark text for primary
  textSecondary: '#666666', // Muted text for secondary
  border: '#E0E0E0', // Light border
  accentBlue: '#3B82F6', // A nice blue
  accentGreen: '#10B981', // A nice green
  accentRed: '#EF4444', // A nice red
  accentYellow: '#F59E0B', // A nice yellow
  accentPurple: '#8B5CF6', // A nice purple
  chartGrid: '#E5E7EB', // Lighter grid lines for charts
  chartBar: '#60A5FA', // Lighter blue for chart bars
};

export const Wrapper = styled(motion.div)`
  padding: ${Spacing.lg};
  background-color: ${Colors.background};
  min-height: 100vh;
  color: ${Colors.textPrimary};
`;

export const SectionHeader = styled.h2`
  font-size: 1.8rem;
  margin-bottom: ${Spacing.md};
  color: ${Colors.textPrimary};
`;

export const FilterGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${Spacing.md};
  margin-bottom: ${Spacing.lg};
  padding: ${Spacing.md};
  background-color: ${Colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const FilterItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.xs};
`;

export const ScoreRangeText = styled.div`
  font-size: 0.9rem;
  color: ${Colors.textSecondary};
  margin-bottom: ${Spacing.sm};
`;

export const MetricContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${Spacing.md};
  margin-bottom: ${Spacing.lg};
`;

export const MetricCardStyled = styled(motion.div)`
  background-color: ${Colors.cardBackground};
  padding: ${Spacing.md};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const MetricTitle = styled.h3`
  font-size: 1rem;
  color: ${Colors.textSecondary};
  margin-bottom: ${Spacing.xs};
`;

export const MetricValue = styled.span`
  font-size: 2.2rem;
  font-weight: bold;
  color: ${Colors.textPrimary};
`;

export const MetricValueAccent = styled(MetricValue)<{ color: string }>`
  color: ${(props) => props.color};
`;

export const MetricDescription = styled.p`
  font-size: 0.8rem;
  color: ${Colors.textSecondary};
  margin-top: ${Spacing.sm};
`;

export const DonutWrapper = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SectionDivider = styled.div`
  height: 1px;
  background-color: ${Colors.border};
  margin: ${Spacing.xl} 0;
`;

export const ChartCard = styled(motion.div)`
  background-color: ${Colors.cardBackground};
  padding: ${Spacing.md};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: ${Spacing.lg};
`;

export const ChartTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${Spacing.md};
  color: ${Colors.textPrimary};
`;

export const ListCard = styled(motion.div)`
  background-color: ${Colors.cardBackground};
  padding: ${Spacing.md};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

export const ListTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: ${Spacing.md};
  color: ${Colors.textPrimary};
`;

export const PerformanceGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${Spacing.md};
  margin-bottom: ${Spacing.lg};
`;

export const ListColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ListSubHeader = styled.h4`
  font-size: 1rem;
  color: ${Colors.textPrimary};
  margin-bottom: ${Spacing.sm};
  border-bottom: 1px solid ${Colors.border};
  padding-bottom: ${Spacing.xs};
`;

export const StyledScrollArea = styled(ScrollArea)`
  height: 20rem; /* Adjust as needed */
  width: 100%;
  overflow-y: auto;
`;

export const StyledUl = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const StyledLi = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${Spacing.sm} 0;
  border-bottom: 1px solid ${Colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const ListText = styled.span`
  color: ${Colors.textPrimary};
  font-size: 0.95rem;
`;

export const BadgeStyled = styled(Badge)<{ className?: string }>`
  &.default {
    background-color: ${Colors.accentBlue};
    color: white;
  }
  &.secondary {
    background-color: ${Colors.textSecondary};
    color: white;
  }
`;

export const StyledTable = styled(motion.table)`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${Spacing.md};
`;

export const StyledThead = styled.thead`
  background-color: ${Colors.background};
`;

export const StyledTh = styled.th`
  padding: ${Spacing.sm};
  text-align: left;
  font-size: 0.85rem;
  color: ${Colors.textSecondary};
  border-bottom: 1px solid ${Colors.border};
`;

export const StyledTbody = styled.tbody``;

export const StyledTr = styled(motion.tr)`
  border-bottom: 1px solid ${Colors.border};
  &:last-child {
    border-bottom: none;
  }
`;

export const StyledTd = styled.td`
  padding: ${Spacing.sm};
  color: ${Colors.textPrimary};
  font-size: 0.9rem;

  &.rank-top {
    font-weight: bold;
    color: ${Colors.accentGreen};
  }

  &.rank-bottom {
    font-weight: bold;
    color: ${Colors.accentRed};
  }

  &.score {
    font-weight: bold;
    color: ${Colors.accentPurple};
  }

  &.variance {
    font-weight: bold;
    color: ${Colors.accentYellow};
  }
`;