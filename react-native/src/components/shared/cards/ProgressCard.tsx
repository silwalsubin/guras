import React from 'react';
import BaseCard from './BaseCard';
import ProgressRow from '../ui/ProgressRow';

export interface ProgressData {
  minutes: number;
  sessions: number;
  streak: number;
}

interface ProgressCardProps {
  data: ProgressData;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ data }) => {
  return (
    <BaseCard>
      <ProgressRow label="Minutes" value={data.minutes} />
      <ProgressRow label="Sessions" value={data.sessions} />
      <ProgressRow 
        label="Streak" 
        value={`${data.streak} days`} 
      />
    </BaseCard>
  );
};

export default ProgressCard; 