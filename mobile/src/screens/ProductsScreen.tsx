import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
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
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';

interface ProductsScreenProps {
  navigation: any;
  route?: {
    params?: {
      brandFilter?: Brand;
    };
  };
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation, route }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (route?.params?.brandFilter) {
      setSelectedBrand(route.params.brandFilter);
      fetchProducts('', route.params.brandFilter);
    } else {
      fetchProducts();
    }
  }, [route?.params?.brandFilter]);

  const fetchProducts = async (search?: string, brand?: Brand | null) => {
    try {
      let params = '';
      const queryParams = [];
      
      if (search) {
        queryParams.push(`search=${search}`);
      }
      
      if (brand) {
        queryParams.push(`brand=${brand.slug}`);
      }
      
      if (queryParams.length > 0) {
        params = `?${queryParams.join('&')}`;
      }
      
      const apiUrl = `${API_ENDPOINTS.PRODUCTS.LIST}${params}`;
      console.log('API URL:', apiUrl);
      const response = await api.get(apiUrl);
      console.log('API Response:', response.data);
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(searchQuery, selectedBrand);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProducts(searchQuery, selectedBrand);
  };

  const clearFilter = () => {
    setSelectedBrand(null);
    setLoading(true);
    fetchProducts(searchQuery);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const price = parseFloat(item.price);
    const isDisplayOnly = price === 0;

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          onPress={() => handleProductPress(item)}
          activeOpacity={0.8}
        >
          <Card variant="elevated" padding="sm">
            <Image
              source={{ uri: item.main_image }}
              style={styles.productImage}
              resizeMode="cover"
            />
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
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* Search and Filter */}
        <View style={styles.header}>
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
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          
          {selectedBrand && (
            <View style={styles.filterContainer}>
              <TouchableOpacity style={styles.filterChip} onPress={clearFilter}>
                <Typography variant="caption" style={styles.filterText}>
                  {selectedBrand.name}
                </Typography>
                <Ionicons name="close" size={14} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.productsHeader}>
            <Typography variant="h2" style={styles.productsTitle}>
              Products
            </Typography>
          </View>
        </View>

        {/* Products Grid */}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.sm,
    marginBottom: 0,
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
  filterContainer: {
    marginTop: theme.spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  filterText: {
    marginRight: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  productsHeader: {
    marginTop: theme.spacing.lg,
  },
  productsTitle: {
    marginBottom: 0,
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  productCard: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
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
});

export default ProductsScreen;