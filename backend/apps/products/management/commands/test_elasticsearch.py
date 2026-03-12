from django.core.management.base import BaseCommand
from django.conf import settings
from products.services import ProductService
from products.models import Product
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test Elasticsearch integration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--query',
            type=str,
            default='lipstick',
            help='Search query to test'
        )

    def handle(self, *args, **options):
        query = options['query']
        
        self.stdout.write(
            self.style.SUCCESS(f'Testing Elasticsearch integration with query: "{query}"')
        )
        
        # Test basic connection
        try:
            from elasticsearch_dsl import connections
            es = connections.get_connection()
            cluster_health = es.cluster.health()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Elasticsearch cluster health: {cluster_health["status"]}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Elasticsearch connection failed: {str(e)}')
            )
            self.stdout.write(
                self.style.WARNING('Make sure Elasticsearch is running on localhost:9200')
            )
            return

        # Test search functionality
        self.stdout.write('\n--- Testing Product Search ---')
        try:
            products = ProductService.search_products(query, limit=5)
            if products:
                self.stdout.write(f'✅ Found {len(products)} products:')
                for i, product in enumerate(products, 1):
                    brand = product.brand.name if product.brand else 'No Brand'
                    self.stdout.write(f'  {i}. {product.name} ({brand})')
            else:
                self.stdout.write('⚠️ No products found')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Search failed: {str(e)}')
            )

        # Test suggestions
        self.stdout.write('\n--- Testing Search Suggestions ---')
        try:
            suggestions = ProductService.search_suggestions(query, limit=5)
            if suggestions:
                self.stdout.write(f'✅ Found {len(suggestions)} suggestions:')
                for i, suggestion in enumerate(suggestions, 1):
                    self.stdout.write(f'  {i}. {suggestion["text"]} ({suggestion["brand"]})')
            else:
                self.stdout.write('⚠️ No suggestions found')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Suggestions failed: {str(e)}')
            )

        # Database statistics
        total_products = Product.objects.count()
        
        self.stdout.write(f'\n--- Database Statistics ---')
        self.stdout.write(f'Total products: {total_products}')
        
        self.stdout.write(
            self.style.SUCCESS('\n✅ Test completed!')
        )