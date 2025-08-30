import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  longDescription: string;
  inStock: boolean;
  nutritionInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Mock data - replace with API call
  const product: Product = {
    id: 1,
    name: 'Fresh Apples',
    price: 3.99,
    image: '🍎',
    category: 'fruits',
    description: 'Crispy red apples',
    longDescription: 'These premium red apples are hand-picked from local orchards. Known for their crisp texture and sweet flavor, they are perfect for snacking, baking, or adding to salads. Rich in fiber, vitamin C, and antioxidants, these apples are not only delicious but also nutritious.',
    inStock: true,
    nutritionInfo: {
      calories: 95,
      protein: '0.5g',
      carbs: '25g',
      fat: '0.3g'
    }
  };

  const addToCart = () => {
    // TODO: Implement cart functionality
    console.log('Added to cart:', { product, quantity });
  };

  const relatedProducts = [
    { id: 2, name: 'Bananas', price: 2.49, image: '🍌' },
    { id: 3, name: 'Oranges', price: 4.99, image: '🍊' },
    { id: 4, name: 'Grapes', price: 5.99, image: '🍇' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-green-600 hover:text-green-700 mb-4"
          >
            ← Back to Products
          </button>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="text-center">
              <div className="text-9xl mb-4">{product.image}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                product.inStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-4 capitalize">Category: {product.category}</p>
              <p className="text-gray-700 mb-6">{product.longDescription}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-green-600">${product.price}</span>
                <span className="text-gray-500 ml-2">per item</span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition duration-300 ${
                  product.inStock
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? `Add ${quantity} to Cart - $${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
              </button>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="border-t border-gray-200 p-8">
            <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{product.nutritionInfo.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{product.nutritionInfo.protein}</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{product.nutritionInfo.carbs}</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{product.nutritionInfo.fat}</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <div className="text-4xl mb-3">{relatedProduct.image}</div>
                <h4 className="font-semibold mb-2">{relatedProduct.name}</h4>
                <p className="text-green-600 font-bold">${relatedProduct.price}</p>
                <button
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="mt-3 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
