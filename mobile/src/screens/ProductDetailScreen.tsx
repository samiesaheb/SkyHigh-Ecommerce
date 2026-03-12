import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
// import { useReviewsStore } from '../stores';
// import { ReviewSummary } from '../components/reviews/ReviewSummary';
// import { ReviewCard } from '../components/reviews/ReviewCard';
// import WishlistButton from '../components/wishlist/WishlistButton';
import { getImageUrl } from '../utils';

interface ProductDetailScreenProps {
  route: {
    params: {
      product: Product;
    };
  };
  navigation: any;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  // const {
  //   reviews,
  //   reviewSummary,
  //   isLoading: reviewsLoading,
  //   fetchProductReviews,
  //   fetchReviewSummary,
  // } = useReviewsStore();
  
  const price = parseFloat(product.price);
  const isDisplayOnly = price === 0;
  const isGeometryProduct = product.brand.slug === 'geometry';
  // const showReviews = isGeometryProduct && !isDisplayOnly;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: product.name,
    });
  }, [navigation, product.name]);

  // useEffect(() => {
  //   if (showReviews) {
  //     fetchProductReviews(product.id);
  //     fetchReviewSummary(product.id);
  //   }
  // }, [showReviews, product.id, fetchProductReviews, fetchReviewSummary]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${product.name} added to your cart`,
      [
        { text: 'Continue Shopping', style: 'default' },
        { 
          text: 'View Cart', 
          style: 'default',
          onPress: () => navigation.navigate('CartTab')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(product.main_image) }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* !isDisplayOnly && (
          <View style={styles.wishlistContainer}>
            <WishlistButton product={product} size="md" />
          </View>
        ) */}
      </View>

      <View style={styles.content}>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.brandName}>{product.brand.name}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {isDisplayOnly ? 'Display Only' : `฿${product.price}`}
          </Text>
        </View>

        {/* Quantity Selector - Only show if not display only */}
        {!isDisplayOnly && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <Ionicons name="remove" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Reviews Section - Only for Geometry brand products */}
        {/* showReviews && (
          <View style={styles.reviewsContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={() => navigation.navigate('WriteReview', { product })}
              >
                <Ionicons name="create-outline" size={16} color="#007AFF" />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* reviewsLoading ? (
              <View style={styles.reviewsLoading}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : (
              <>
                {reviewSummary && reviewSummary.total_reviews > 0 && (
                  <ReviewSummary summary={reviewSummary} />
                )}
                
                {reviews.length > 0 ? (
                  <View style={styles.reviewsList}>
                    <Text style={styles.reviewsListTitle}>
                      Recent Reviews ({reviews.length})
                    </Text>
                    {reviews.slice(0, 3).map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {reviews.length > 3 && (
                      <TouchableOpacity 
                        style={styles.viewAllReviewsButton}
                        onPress={() => navigation.navigate('Reviews', { productId: product.id })}
                      >
                        <Text style={styles.viewAllReviewsText}>
                          View All Reviews ({reviews.length})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : reviewSummary?.total_reviews === 0 ? (
                  <View style={styles.noReviews}>
                    <Ionicons name="star-outline" size={48} color="#ccc" />
                    <Text style={styles.noReviewsText}>No reviews yet</Text>
                    <Text style={styles.noReviewsSubtext}>Be the first to review this product!</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        ) */}

        {/* Add to Cart Button - Only show if not display only */}
        {!isDisplayOnly && (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="bag-add" size={24} color="white" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
        
        {/* Display Only Notice */}
        {isDisplayOnly && (
          <View style={styles.displayOnlyContainer}>
            <Ionicons name="information-circle" size={24} color="#666" />
            <Text style={styles.displayOnlyText}>
              This is a display-only item and cannot be purchased.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  wishlistContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  content: {
    padding: 20,
  },
  productInfo: {
    marginBottom: 30,
  },
  brandName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantityContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  displayOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  displayOnlyText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  reviewsContainer: {
    marginBottom: 30,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
  },
  writeReviewText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reviewsList: {
    marginTop: 16,
  },
  reviewsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  viewAllReviewsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllReviewsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default ProductDetailScreen;