export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white-800">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="mb-4">
        By accessing or using the Sky High International Co., Ltd. website, you agree to be bound
        by these Terms and Conditions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Use of Site</h2>
      <p className="mb-4">
        This site and its content are intended for personal, non-commercial use. You may not copy,
        distribute, or exploit the site without our written consent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Product Descriptions</h2>
      <p className="mb-4">
        We make every effort to display our products accurately. However, we do not guarantee that
        all product descriptions are error-free.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Orders and Payments</h2>
      <p className="mb-4">
        By placing an order, you agree to provide accurate and complete payment and delivery
        information. We reserve the right to cancel orders for any reason.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Limitation of Liability</h2>
      <p className="mb-4">
        We are not liable for any indirect or consequential damages resulting from the use of this
        site or products.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Governing Law</h2>
      <p className="mb-4">
        These terms are governed by the laws of Thailand. Any disputes will be resolved under Thai
        jurisdiction.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
