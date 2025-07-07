export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        At Sky High International Co., Ltd., we are committed to protecting your personal
        information and your right to privacy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We collect personal information such as your name, email, shipping address, and order
        details when you make a purchase or sign up on our site.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
      <p className="mb-4">
        Your information is used solely to fulfill your orders, send updates, and improve our
        services. We do not sell or rent your information to third parties.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Cookies</h2>
      <p className="mb-4">
        We use cookies to enhance your experience on our site. You may disable cookies in your
        browser settings.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, correct, or delete your personal information. Please contact
        us for any privacy-related concerns.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
