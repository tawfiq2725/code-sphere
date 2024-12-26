export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        <title>Contact Us</title>
      </h1>
      <p className="text-center text-gray-300 mb-8 max-w-2xl">
        We're here for you: Connect with us for any questions or concerns.
      </p>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <p className="text-gray-400 mb-4">
          For technical questions, please post your questions on our forum where
          you can get help from fellow students.
        </p>
        <p className="text-gray-400 mb-4">
          For course suggestions and career advice, check out our learning
          paths.
        </p>
        <p className="font-semibold">Support Mail:</p>
        <p className="mb-4">support@codesphere.com</p>
        <p className="font-semibold">Support Mobile:</p>
        <p>8787878787</p>
      </div>
    </div>
  );
}
