import React, { memo, useMemo } from 'react';
import { FlatList, FlatListProps, ListRenderItem } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'getItemLayout'> {
  data: T[];
  itemHeight?: number;
  estimatedItemHeight?: number;
}

const ITEM_HEIGHT = 280; // Default height for product cards

function OptimizedFlatListComponent<T>({
  data,
  renderItem,
  itemHeight = ITEM_HEIGHT,
  estimatedItemHeight,
  keyExtractor,
  ...props
}: OptimizedFlatListProps<T>) {
  
  // Memoize getItemLayout for better performance
  const getItemLayout = useMemo(() => {
    if (itemHeight) {
      return (_: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      });
    }
    return undefined;
  }, [itemHeight]);

  // Memoize keyExtractor
  const memoizedKeyExtractor = useMemo(() => {
    if (keyExtractor) return keyExtractor;
    return (item: any, index: number) => {
      if (item.id) return item.id.toString();
      return index.toString();
    };
  }, [keyExtractor]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={getItemLayout}
      // Performance optimizations
      maxToRenderPerBatch={10}
      initialNumToRender={6}
      windowSize={10}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      // Scroll optimizations
      scrollEventThrottle={16}
      {...props}
    />
  );
}

// Export memoized component
export const OptimizedFlatList = memo(OptimizedFlatListComponent) as <T>(
  props: OptimizedFlatListProps<T>
) => JSX.Element;