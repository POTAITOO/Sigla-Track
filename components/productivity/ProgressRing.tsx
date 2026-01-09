import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressRingProps = {
  points: number;
  badgeThreshold: number;
  maxPoints: number;
};

const ProgressRing = ({ points, badgeThreshold, maxPoints }: ProgressRingProps) => {
  const displayPoints = Math.min(points, maxPoints);
  const progress = Math.min((displayPoints % badgeThreshold) / badgeThreshold, 1);
  const radius = 48;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
      <Svg width={120} height={120}>
        <Circle
          cx={60}
          cy={60}
          r={radius}
          stroke="#fde4ea"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={60}
          cy={60}
          r={radius}
          stroke="#f43f5e"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin="60,60"
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 120, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: 28 }}>{displayPoints}</Text>
      </View>
    </View>
  );
};

export default ProgressRing;
