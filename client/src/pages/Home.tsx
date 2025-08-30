import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const featuredCategories = [
    { id: 1, name: 'Fresh Fruits', image: '🍎', description: 'Farm fresh fruits delivered daily' },
    { id: 2, name: 'Vegetables', image: '🥕', description: 'Organic vegetables from local farms' },
    { id: 3, name: 'Dairy Products', image: '🥛', description: 'Fresh dairy products and alternatives' },
    { id: 4, name: 'Bakery', image: '🍞', description: 'Freshly baked bread and pastries' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Fresh Groceries Delivered</h1>
          <p className="text-xl mb-8">Get the freshest groceries delivered to your doorstep in under 30 minutes</p>
          <Link 
            to="/products" 
            className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <div className="text-6xl mb-4">{category.image}</div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Link 
                  to={`/products?category=${category.name.toLowerCase().replace(' ', '-')}`}
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  Browse →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your groceries delivered in under 30 minutes</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Quality</h3>
              <p className="text-gray-600">Hand-picked fresh produce from trusted suppliers</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Safe and secure payment options available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
