import { useQuery } from '@apollo/client';
import { orderClient } from '../lib/apollo-client';
import Layout from '../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import Link from 'next/link';

const GET_ORDERS_BY_USER = gql`
  query GetOrdersByUser($userId: ID!) {
    ordersByUser(userId: $userId) {
      order_id
      order_date
      total_amount
      status
      shipment_status
      shipment_id
      items {
        order_item_id
        product_id
        quantity
        price
        product {
          name
        }
      }
    }
  }
`;

export default function Orders() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const { data, loading, error } = useQuery(GET_ORDERS_BY_USER, {
    client: orderClient,
    variables: { userId: String(user?.user_id || '0') }, // Ensure userId is string
    skip: !isAuthenticated || !user,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Dipesan':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dalam Pengiriman':
        return 'bg-blue-100 text-blue-800';
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please login to view your orders</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
            >
              Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Orders error:', error);
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Error loading orders: {error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const orders = data?.ordersByUser || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You don&apos;t have any orders yet</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.order_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      {order.shipment_status && (
                        <p className="text-sm text-gray-600 mt-2">
                          Shipment: {order.shipment_status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.order_item_id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.product?.name || `Product ${item.product_id}`} x{' '}
                            {item.quantity}
                          </span>
                          <span className="text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/orders/${order.order_id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

