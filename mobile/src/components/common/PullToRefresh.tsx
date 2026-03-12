import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { COLORS } from '@/constants';
import { useHaptics } from '@/utils/haptics';

interface PullToRefreshProps extends Omit<RefreshControlProps, 'onRefresh'> {
  onRefresh: () => Promise<void> | void;
  hapticFeedback?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  hapticFeedback = true,
  ...props
}) => {
  const haptics = useHaptics();

  const handleRefresh = async () => {
    if (hapticFeedback) {
      await haptics.pullToRefresh();
    }
    
    await onRefresh();
  };

  return (
    <RefreshControl
      {...props}
      onRefresh={handleRefresh}
      tintColor={COLORS.PRIMARY}
      colors={[COLORS.PRIMARY]}
      progressBackgroundColor={COLORS.SURFACE}
    />
  );
};