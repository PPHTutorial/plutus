'use client';

import { useState } from 'react';
import { pricingPlans, PricingPlan } from '@/app/data/pricing-plans';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/hooks/AuthContext';
import toast from 'react-hot-toast';

interface PricingProps {
  onSelectPlan?: (plan: PricingPlan) => void;
}

export default function Pricing({ onSelectPlan }: PricingProps) {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('btc');
  const [loading, setLoading] = useState<string | null>(null);
  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, { code: string; discount: number }>>({});

  const currencies = [
    { code: 'btc', name: 'Bitcoin', symbol: '₿' },
    { code: 'eth', name: 'Ethereum', symbol: 'Ξ' },
    { code: 'usdttrc20', name: 'USDT', symbol: '$' },
    { code: 'ltc', name: 'Litecoin', symbol: 'Ł' },
    { code: 'doge', name: 'Dogecoin', symbol: 'Ð' },
    { code: 'trx', name: 'TRON', symbol: 'TRX' },
  ];

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      toast.error('Please sign in to access server access', {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
      return;
    }

    setLoading(plan.id);

    // Get applied coupon for this plan
    const appliedCoupon = appliedCoupons[plan.id];
    const finalPrice = appliedCoupon
      ? plan.price * (1 - appliedCoupon.discount)
      : plan.price;



    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          payCurrency: selectedCurrency,
          originalPrice: plan.price,
          finalPrice: finalPrice,
          couponCode: appliedCoupon?.code || null,
          discount: appliedCoupon?.discount || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Store payment info in localStorage for status checking
      localStorage.setItem('currentPayment', JSON.stringify({
        paymentId: data.payment.paymentId,
        planId: plan.id,
        originalPrice: plan.price,
        finalPrice: finalPrice,
        couponCode: appliedCoupon?.code || null,
      }));

      // Call the onSelectPlan callback if provided
      if (onSelectPlan) {
        onSelectPlan(plan);
      }

      // Show payment details in a modal or redirect to payment page
      toast.success('Server access activated! Complete payment to activate.', {
        style: {
          background: '#333',
          color: '#fff',
        }
      });

      // You can redirect to a payment page or show payment details in a modal
      window.open(data.payment.paymentUrl || '/payment/success');

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.message || 'Failed to activate server access', {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gray-950 py-12" id="server-plans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choose Your Flashing Server
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Select the perfect server for your crypto flashing operations
          </p>
        </div>

        {/* Currency Selector */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gray-950 rounded-lg p-2 shadow-sm border border-gray-950">
            <div className="grid grid-cols-3 md:flex space-x-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCurrency === currency.code
                    ? 'bg-green-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {currency.symbol} {currency.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 ">
          {pricingPlans.map((plan) => {
            // Get applied coupon for this specific plan
            const appliedCoupon = appliedCoupons[plan.id];
            const finalPrice = appliedCoupon
              ? plan.price * (1 - appliedCoupon.discount)
              : plan.price;

            const handleCouponCode = (code: string) => {
              if (!code.trim()) {
                // Remove coupon if input is empty
                setAppliedCoupons(prev => {
                  const newCoupons = { ...prev };
                  delete newCoupons[plan.id];
                  return newCoupons;
                });
                return;
              }

              // Find matching coupon for this plan
              const validCoupon = plan.couponCode?.find(c => c.code.toLowerCase() === code.toLowerCase());

              if (validCoupon) {
                // Apply valid coupon
                setAppliedCoupons(prev => ({
                  ...prev,
                  [plan.id]: { code: validCoupon.code, discount: validCoupon.discount }
                }));

                const discountedPrice = plan.price * (1 - validCoupon.discount);
                const discountPercent = Math.round(validCoupon.discount * 100);

                toast.success(`Coupon applied! ${discountPercent}% off - New price: $${discountedPrice.toLocaleString()}`, {
                  style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }
                });
              } else {
                // Invalid coupon
                toast.error('Invalid coupon code for this plan', {
                  style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }
                });
              }
            }

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-950 rounded-lg shadow-lg divide-y divide-gray-700 border ${plan.popular
                  ? 'border-2 border-green-800 transform scale-105'
                  : 'border-gray-700'
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-800 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-medium text-white">{plan.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                  <div className="flex flex-col lg:flex-row items-center mt-8 gap-4 justify-between">
                    <div className="flex flex-col">
                      {appliedCoupon && (
                        <span className="text-lg font-medium text-gray-400 line-through mb-1">
                          ${plan.price.toLocaleString()}
                        </span>
                      )}
                      <p className="">
                        <span className="text-4xl font-extrabold text-white">
                          ${finalPrice.toLocaleString()}
                        </span>
                        <span className="text-base font-medium text-gray-400"> USD</span>
                        {appliedCoupon && (
                          <span className="ml-2 text-sm font-medium text-green-400">
                            ({Math.round(appliedCoupon.discount * 100)}% off)
                          </span>
                        )}
                      </p>
                    </div>
                    <input
                      type="text"
                      className="ml-4 p-2 border border-green-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-green-800"
                      placeholder='Coupon code'
                      value={appliedCoupon?.code || ''}
                      onChange={(e) => handleCouponCode(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading === plan.id}
                    className={`mt-8 w-full py-3 px-6 border border-transparent rounded-md text-center text-sm font-medium transition-colors ${plan.popular
                      ? 'bg-green-800 text-white hover:bg-green-700 focus:ring-green-800'
                      : 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Activating Server...
                      </div>
                    ) : (
                      'Activate Server'
                    )}
                  </button>
                </div>

                <div className="pt-6 pb-8 px-6">
                  <h4 className="text-sm font-medium text-gray-300 tracking-wide uppercase">
                    Features included
                  </h4>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex space-x-3">
                        <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-800" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Coupon Code Hint */}
                  {plan.couponCode && plan.couponCode.length > 0 && !appliedCoupon && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-800/30 rounded-md">
                      <p className="text-xs text-green-400">
                        💡 Hint: Join our Telegram channel for huge discounts up to 68% off:
                        <a
                          href="https://t.me/+cQ-BabDBEbM0MGE0"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-green-300 ml-1"
                        >
                          CLICK TO JOIN
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
