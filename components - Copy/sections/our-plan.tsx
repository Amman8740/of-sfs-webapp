'use client';

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/types_db';
import { useRouter, usePathname } from 'next/navigation';
import { getErrorRedirect } from '@/lib/utils';
import { getStripe } from '@/lib/utils/stripe/client';
import {
  checkoutWithStripe,
  createStripePortal,
} from '@/lib/utils/stripe/server';
// import { createStripePortal } from "@/lib/utils/stripe/server";
import { OvalSpinner } from '@/components/ui';
import { PiCheck } from 'react-icons/pi';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;

interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user?: User | null | undefined;
  products: ProductWithPrices[];
  subscription?: SubscriptionWithProduct | null;
}

export default function OurPlan ({ user, products, subscription }: Props) {
  const [enabled, setEnabled] = useState(false);
  let plan = 'month';
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const router = useRouter();
  const currentPath = usePathname();
  const [loading, setLoading] = useState(false);

  const handleStripePortalRequest = async () => {
    setLoading(true);
    setPriceIdLoading('portal');
    const redirectUrl = await createStripePortal(currentPath);
    return router.push(redirectUrl);
  };

  const handleStripeCheckout = async (price: Price) => {
    setLoading(true);
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/auth/signin');
    }

    if (subscription) {
      await handleStripePortalRequest();
      return;
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath,
      // user
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.',
        ),
      );
    }

    const stripe = await getStripe();

    await stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  return (
    <>
      {/* Our Plan Section */}
      <section
        id='pricing'
        aria-label='We offer a single plan that incorporates all features'
        className='z-0 flex flex-col items-center self-stretch px-5 py-8 mx-auto sm:px-0 sm:py-24'
      >
        <>
          <div className='flex flex-col justify-center w-full space-y-10 sm:max-w-screen-md'>
            <div className='justify-center space-y-3 text-center'>
              <h1 className='font-sans text-3xl font-bold text-canvas-text-contrast sm:text-5xl '>
                Our <span className='text-primary-solid'>Plan</span>
              </h1>
              <p className='font-sans text-lg font-semibold text-canvas-text'>
                We offer a single plan that incorporates all features
              </p>
              <div className='flex items-center justify-center'>
                <button
                  onClick={() => setEnabled(false)}
                  className={`mr-2 text-sm font-medium ${!enabled ? 'text-canvas-text-contrast' : 'text-canvas-solid'}`}
                >
                  Monthly
                </button>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={`group relative flex h-7 w-14 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white ${
                    enabled ? 'bg-primary-solid' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden='true'
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-on-primary shadow-lg ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </Switch>
                <button
                  onClick={() => setEnabled(true)}
                  className={`ml-2 text-sm font-medium ${enabled ? 'text-canvas-text-contrast    ' : 'text-canvas-solid'}`}
                >
                  Annually
                </button>
              </div>
            </div>

            <div className='flex flex-col justify-between space-y-[32px] rounded-3xl bg-primary-solid px-[10px] py-[10px] shadow-xl sm:flex-row sm:space-x-10 sm:space-y-0'>
              <div id='product'>
                {products?.map((product) => {
                  if (enabled) 
                  {plan = 'year';}
                  
                  const price = product?.prices?.find(
                    (price) => price.interval === plan,
                  );

                  if (!price) {return null;}
                  const priceString = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price?.currency || '',
                    minimumFractionDigits: 0,
                  }).format((price?.unit_amount || 0) / 100);
                  if (subscription?.status === 'active') 
                  {return (
                    <div
                      className='h-full space-y-[40px] rounded-2xl bg-primary-solid-hover px-10 py-10 sm:w-96 sm:px-[30px] sm:py-[30px]'
                      key={product.id}
                    >
                      <div className='justify-center space-y-[20px] text-center'>
                        <p className='font-sans text-lg font-semibold text-primary-on-primary'>
                          {enabled ? 'Billed Annually' : 'Billed Monthly'}
                        </p>
                        <div className='ali flex flex-row items-baseline justify-center space-x-[6px] text-center'>
                          <h3 className='font-sans text-5xl font-bold text-primary-on-primary'>
                            {priceString}
                          </h3>
                          <p className='font-sans text-base font-semibold text-primary-on-primary'>
                              USD
                          </p>
                        </div>
                      </div>

                      <div className='mx-auto space-y-[20px] text-center'>
                        <div className='flex justify-center'>
                          <Button
                            className='w-full h-10 px-4 space-x-2'
                            color='primary'
                            variant='solid'
                            size='small'
                            onClick={handleStripePortalRequest}
                            disabled={priceIdLoading === 'portal'}
                          >
                            {loading ? (
                              <>
                                  View Your Subscription <OvalSpinner />
                              </>
                            ) : (
                              <p className='font-sans text-sm font-semibold text-center'>
                                  View Your Subscription
                              </p>
                            )}
                          </Button>
                        </div>
                        <p className='font-sans text-sm font-medium text-primary-on-primary'>
                            Invoices and receipts available for easy company
                            reimbursement
                        </p>
                      </div>
                    </div>
                  );}
                  else 
                  {return (
                    <div
                      className='flex flex-col items-center justify-center h-full'
                      key={product.id}
                    >
                      <div className='h-full space-y-[40px] rounded-2xl bg-primary-solid-hover px-10 py-10 sm:w-96 sm:px-[30px] sm:py-[30px]'>
                        <div className='justify-center space-y-[20px] text-center'>
                          <p className='font-sans text-lg font-semibold text-primary-on-primary'>
                            {enabled ? 'Billed Annually' : 'Billed Monthly'}
                          </p>
                          <div className='ali flex flex-row items-baseline justify-center space-x-[6px] text-center'>
                            <h3 className='font-sans text-5xl font-bold text-primary-on-primary'>
                              {priceString}
                            </h3>
                            <p className='font-sans text-base font-semibold text-primary-on-primary'>
                                USD
                            </p>
                          </div>
                        </div>

                        <div className='mx-auto space-y-[20px] text-center'>
                          <div className='flex justify-center'>
                            <Button
                              className='h-[40px] w-[235px] space-x-[8px] !bg-primary-on-primary px-4 !text-primary-solid'
                              color='primary'
                              variant='solid'
                              size='medium'
                              onClick={() =>
                                price && handleStripeCheckout(price)
                              }
                              disabled={priceIdLoading === price.id}
                            >
                              {loading ? (
                                <>
                                    Subscribe Now <OvalSpinner />
                                </>
                              ) : (
                                <p className='font-sans text-sm font-semibold text-center'>
                                    Subscribe Now
                                </p>
                              )}
                            </Button>
                          </div>
                          <p className='font-sans text-sm font-medium text-primary-on-primary'>
                              Invoices and receipts available for easy company
                              reimbursement
                          </p>
                        </div>
                      </div>
                    </div>
                  );}
                  
                })}
              </div>

              <div className='space-y-[32px]  px-[10px] py-[10px] sm:px-5 sm:py-5'>
                <h2 className='text-xl font-semibold text-canvas-bg'>Features</h2>
                <div className='flex flex-col space-y-[16px] sm:space-x-[80px] sm:space-y-0'>
                  <div className='space-y-4'>
                    <div className='flex space-x-2'>
                      <PiCheck />
                      <p className='text-base font-normal text-primary-on-primary'>
                        Unlimited master and slave tab syncing
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <PiCheck />
                      <p className='text-base font-normal text-primary-on-primary'>
                        Early access to beta features
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <PiCheck />
                      <p className='text-base font-normal text-primary-on-primary'>
                        Access across multiple devices
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <PiCheck width='24' height='24' />
                      <p className='text-base font-normal text-primary-on-primary'>
                        20% discount compared to monthly plan
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <PiCheck />
                      <p className='text-base font-normal text-primary-on-primary'>
                        24/7 Customer Support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </section>
    </>
  );
};
