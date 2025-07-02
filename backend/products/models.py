from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)  # ← add this line

    def __str__(self):
        return self.name

class Product(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    main_image = models.ImageField(upload_to="products/")
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    zip = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
