import React from 'react';
import { Text, View } from 'react-native';

type ProgressRingProps = {
  points: number;
  badgeThreshold: number;
  maxPoints: number;
};

const ProgressRing = ({ points, badgeThreshold, maxPoints }: ProgressRingProps) => {
  const displayPoints = Math.min(points, maxPoints);
  const progress = Math.min((displayPoints % badgeThreshold) / badgeThreshold, 1);

  return (
    <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 8,
          borderColor: '#fde4ea',
        }}
      />
      
      {/* Progress segments - create 12 segments for smooth visual */}
      <View style={{ position: 'absolute', width: 100, height: 100 }}>
        {[...Array(12)].map((_, i) => {
          const isActive = i < Math.ceil(progress * 12);
          const angle = (i * 30);
          
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 8,
                borderColor: isActive ? '#f43f5e' : 'transparent',
                borderTopColor: isActive ? '#f43f5e' : 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}
      </View>

      {/* Center text */}
      <Text style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: 28, zIndex: 10 }}>
        {displayPoints}
      </Text>
    </View>
  );
};

export default ProgressRing;
