"use client";

export default function HomePage() {
  return (
    <div className="w-full bg-white text-gray-800">
      {/* Hero Section */}
      <section className="h-[70vh] bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Concept to Creation</h1>
          <p className="text-lg mb-6">
            Discover premium cosmetic solutions crafted with science, elegance, and purity.
          </p>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 transition rounded text-white font-medium"
          >
            Explore Our Products
          </a>
        </div>
      </section>



      {/* About Us */}
      <section className="py-20 px-4 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Welcome to Sky High</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          At Sky High International Co., Ltd., we create high-quality, safe, and innovative
          cosmetic products for discerning clients worldwide. Our passion for formulation,
          sustainability, and beauty has made us a trusted partner in the global market.
        </p>
      </section>

      {/* Featured Collections */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-10">Our Featured Collections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Geometry",
                image: "http://127.0.0.1:8000/media/products/geometry/geometry-extra-hair-serum.jpg",
                description: "A bold and modern range of personal care inspired by geometry and design.",
              },
              {
                title: "Skincare",
                image: "http://127.0.0.1:8000/media/products/bodyandskincare/d-white-whitening-soap.jpg",
                description: "Nourishing, natural, and clinically formulated skincare essentials.",
              },
              {
                title: "Haircare",
                image: "http://127.0.0.1:8000/media/products/haircare/myco-hair-long-hair-anti-hair-loss-serum.jpg",
                description: "Advanced hair treatments for strength, shine, and lasting beauty.",
              },
            ].map((collection) => (
              <div
                key={collection.title}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-lg font-semibold mb-2">{collection.title}</h4>
                  <p className="text-gray-600 text-sm">{collection.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-red-600 text-white py-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Start Your Private Label Journey Today</h3>
        <p className="mb-6">Let us help you create and launch your own cosmetics brand.</p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-white text-red-600 font-medium rounded hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
}
