import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Product, Brand } from '../types';
import { useCart } from '../context/CartContext';
import { API_ENDPOINTS } from '../constants';
import { Typography } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
// import WishlistButton from '../components/wishlist/WishlistButton';
import { theme } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async (searchTerm?: string) => {
    setLoading(true);
    try {
      let productsUrl = API_ENDPOINTS.PRODUCTS.LIST;
      if (searchTerm) {
        productsUrl += `?search=${encodeURIComponent(searchTerm)}`;
      }
      
      const [productsResponse, brandsResponse] = await Promise.all([
        api.get(productsUrl),
        api.get(API_ENDPOINTS.BRANDS.LIST),
      ]);
      
      console.log('Products Response:', productsResponse.data);
      console.log('Brands Response:', brandsResponse.data);
      
      setFeaturedProducts(productsResponse.data.results || productsResponse.data);
      setBrands(brandsResponse.data.results || brandsResponse.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      fetchHomeData(searchQuery.trim());
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const price = parseFloat(item.price);
    const isDisplayOnly = price === 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <Card variant="elevated" padding="sm" style={styles.productCardInner}>
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: item.main_image }}
              style={styles.productImage}
              resizeMode="cover"
            />
            {/* !isDisplayOnly && item.id && (
              <View style={styles.wishlistButtonContainer}>
                <WishlistButton product={item} size="sm" />
              </View>
            ) */}
          </View>
          <View style={styles.productInfo}>
            <Typography 
              variant="caption" 
              color="secondary" 
              numberOfLines={1}
              style={styles.brandText}
            >
              {item.brand.name}
            </Typography>
            <Typography 
              variant="body" 
              numberOfLines={2}
              style={styles.productName}
            >
              {item.name}
            </Typography>
            <View style={styles.productFooter}>
              <Typography 
                variant="h3" 
                style={styles.priceText}
              >
                {isDisplayOnly ? 'Display Only' : `฿${item.price}`}
              </Typography>
              {!isDisplayOnly && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.7}
                >
                  <Typography variant="caption" color="inverse">+</Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const handleBrandPress = (brand: Brand) => {
    setSearchQuery('');
    setIsSearchActive(false);
    setSelectedBrand(brand);
    
    // Fetch products filtered by brand
    fetchProductsByBrand(brand.slug);
  };

  const fetchProductsByBrand = async (brandSlug: string) => {
    setLoading(true);
    try {
      const productsUrl = `${API_ENDPOINTS.PRODUCTS.LIST}?brand=${brandSlug}`;
      const response = await api.get(productsUrl);
      setFeaturedProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products by brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBrand = ({ item }: { item: Brand }) => (
    <TouchableOpacity 
      style={styles.brandChip}
      onPress={() => handleBrandPress(item)}
      activeOpacity={0.7}
    >
      <Typography variant="label" style={styles.brandName}>
        {item.name}
      </Typography>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Create sections for the FlatList
  const sections = [
    { type: 'search' },
    { type: 'brands', data: brands },
    { type: 'products', data: featuredProducts },
  ];

  const renderSection = ({ item, index }: { item: any; index: number }) => {
    switch (item.type) {
      case 'search':
        return (
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                {searchQuery ? (
                  <TouchableOpacity 
                    onPress={() => {
                      setSearchQuery('');
                      setIsSearchActive(false);
                      setSelectedBrand(null);
                      fetchHomeData(); // Reset to show all products
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        );
      
      case 'brands':
        return (
          <View style={styles.brandsSection}>
            <FlatList
              data={item.data}
              renderItem={renderBrand}
              keyExtractor={(brand) => brand.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsContainer}
              style={styles.brandsList}
            />
            {(selectedBrand || (isSearchActive && searchQuery.trim())) && (
              <View style={styles.clearFiltersContainer}>
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSelectedBrand(null);
                    setSearchQuery('');
                    setIsSearchActive(false);
                    fetchHomeData(); // Reset to show all products
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={16} color={theme.colors.text.secondary} />
                  <Typography variant="caption" style={styles.clearFiltersText}>
                    {selectedBrand && !isSearchActive 
                      ? 'Clear Filters' 
                      : isSearchActive && !selectedBrand
                        ? 'Show All Products'
                        : 'Clear All'
                    }
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      
      case 'products':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="h2" style={styles.sectionTitle} numberOfLines={2}>
                {isSearchActive && searchQuery.trim()
                  ? `Results for "${searchQuery}"` 
                  : selectedBrand 
                    ? selectedBrand.name 
                    : 'All Products'
                }
              </Typography>
              {((isSearchActive && searchQuery.trim()) || selectedBrand) && (
                <Typography variant="caption" color="secondary" style={styles.resultCount}>
                  {item.data.length} result{item.data.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </View>
            <View style={styles.productsGrid}>
              {item.data.filter(product => product && product.id).map((product: Product, productIndex: number) => (
                <View key={product.id} style={styles.productCardWrapper}>
                  {renderProduct({ item: product })}
                </View>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item, index) => `section-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing['4xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  searchSection: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.xs, // Reduced from sm to xs for longer search bar
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    marginBottom: 0,
    flexWrap: 'wrap',
    lineHeight: 28,
  },
  resultCount: {
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  seeAllText: {
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  brandsSection: {
    marginTop: theme.spacing['2xl'],
  },
  brandsList: {
    overflow: 'visible',
  },
  brandsContainer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingRight: theme.layout.screenPadding * 2,
  },
  brandChip: {
    backgroundColor: theme.colors.text.primary, // Black background
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.lg,
    borderWidth: 0.5,
    borderColor: theme.colors.text.primary,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    letterSpacing: 0.5,
    color: theme.colors.background, // White text
    fontWeight: '500',
  },
  clearFiltersContainer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clearFiltersText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  productCard: {
    flex: 1,
  },
  productCardInner: {
    flex: 1,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.lg,
  },
  wishlistButtonContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  brandText: {
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  productName: {
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceText: {
    flex: 1,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  productCardWrapper: {
    width: '50%',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});

export default HomeScreen;