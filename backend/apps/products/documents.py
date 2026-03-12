from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from elasticsearch_dsl import analyzer
from .models import Product, Brand

# Define analyzers for better search
html_strip = analyzer(
    'html_strip',
    tokenizer="keyword",
    filter=["lowercase", "stop", "snowball"],
    char_filter=["html_strip"]
)

# Register Product document
@registry.register_document
class ProductDocument(Document):
    """Elasticsearch document for Product model"""
    
    # Define fields with different analyzers
    name = fields.TextField(
        analyzer='standard',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    
    description = fields.TextField(
        analyzer=html_strip,
        fields={'raw': fields.KeywordField()}
    )
    
    brand = fields.ObjectField(properties={
        'name': fields.TextField(),
        'slug': fields.KeywordField(),
    })
    
    price = fields.FloatField()
    slug = fields.KeywordField()
    
    # Auto-suggest field
    suggest = fields.CompletionField()
    
    class Index:
        name = 'products'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
    
    class Django:
        model = Product
        fields = [
            'id',
            'created_at',
            'updated_at',
        ]
        related_models = [Brand]
    
    def get_queryset(self):
        """Return the queryset that should be indexed by this document."""
        return super().get_queryset().select_related('brand')
    
    def get_instances_from_related(self, related_instance):
        """If related_models is set, define how to retrieve the Product instance(s) from the related model."""
        if isinstance(related_instance, Brand):
            return related_instance.products.all()
    
    def prepare_suggest(self, instance):
        """Prepare suggestion data"""
        inputs = [instance.name]
        if instance.brand and instance.brand.name:
            inputs.append(instance.brand.name)
        
        return {
            'input': inputs,
            'weight': 10,  # All products get same weight since no is_available field
        }
    
    def prepare_brand(self, instance):
        """Prepare brand data"""
        if instance.brand:
            return {
                'name': instance.brand.name,
                'slug': instance.brand.slug,
            }
        return None


@registry.register_document  
class BrandDocument(Document):
    """Elasticsearch document for Brand model"""
    
    name = fields.TextField(
        analyzer='standard',
        fields={
            'raw': fields.KeywordField(),
            'suggest': fields.CompletionField(),
        }
    )
    
    slug = fields.KeywordField()
    description = fields.TextField(analyzer=html_strip)
    
    # Auto-suggest field
    suggest = fields.CompletionField()
    
    class Index:
        name = 'brands'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
    
    class Django:
        model = Brand
        fields = [
            'id',
        ]
    
    def prepare_suggest(self, instance):
        """Prepare suggestion data for brands"""
        return {
            'input': [instance.name],
            'weight': 5,
        }