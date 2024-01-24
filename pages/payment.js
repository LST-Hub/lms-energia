import React from "react";
import TkPageHead from "../src/components/TkPageHead";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import TkContainer from "../src/components/TkContainer";
import PaymentForm from "../src/components/paymentForm";
import ParticlesAuth from "../src/utils/ParticlesAuth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY);

const Payment = () => {

  return (
    <>
      <TkPageHead>
        <title>{`Payment - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>
      <ParticlesAuth hideFooter={true}>
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </ParticlesAuth>
    </>
  );
};

export default Payment;

Payment.options = {
  layout: false,
  auth: true,
};

