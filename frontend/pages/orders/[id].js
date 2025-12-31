import { useQuery } from '@apollo/client';
import { orderClient } from '../../lib/apollo-client';
import Layout from '../../components/Layout';
import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      order_id
      user_id
      order_date
      total_amount
      status
      shipment_status
      shipment_id
      user {
        name
        email
      }
      items {
        order_item_id
        product_id
        quantity
        price
        product {
          product_id
          name
          description
        }
      }
    }
  }
`;

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuthStore();

  const { data, loading, error } = useQuery(GET_ORDER, {
    client: orderClient,
    variables: { id: String(id) }, // Ensure ID is string to match GraphQL ID type
    skip: !id,
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
        hour: '2-digit',
        minute: '2-digit',
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
            <p className="text-gray-600 mb-4">Please login to view order details</p>
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
            <p className="mt-4 text-gray-600">Loading order...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Order detail error:', error);
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Error loading order: {error.message}</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data?.order) {
    if (loading) {
      return (
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading order...</p>
            </div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">Order not found</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Verify the order belongs to the logged-in user
  if (isAuthenticated && user && data.order.user_id !== parseInt(user.user_id)) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600">You don&apos;t have access to this order</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const order = data.order;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/orders')}
          className="mb-6 text-primary-600 hover:text-primary-700"
        >
          ← Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.order_id}
                </h1>
                <p className="text-gray-600 mt-2">
                  Placed on {formatDate(order.order_date)}
                </p>
              </div>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {order.shipment_id && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Shipment ID: {order.shipment_id}
                </p>
                {order.shipment_status && (
                  <p className="text-sm text-blue-700 mt-1">
                    Status: {order.shipment_status}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex justify-between items-start py-4 border-b border-gray-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product?.name || `Product ${item.product_id}`}
                      </h3>
                      {item.product?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.description}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-semibold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

