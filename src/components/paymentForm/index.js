import React, { useState, useEffect } from "react";
import TkCard, { TkCardBody } from "../TkCard";
import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import { CardElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkButton from "../TkButton";
import TkForm from "../forms/TkForm";
import { useForm } from "react-hook-form";
import TkLabel from "../forms/TkLabel";
import TkContainer from "../TkContainer";
import { FormErrorBox } from "../forms/ErrorText";

function PaymentForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({});

  const [address, setAddress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [count, setCount] = useState(1);
  const [price, setPrice] = useState(10);
  // const [errorMsg, setErrorMsg] = useState("");

  const increment = () => {
    setCount(count + 1);
  };
  const decrement = () => {
    setCount(function (prevCount) {
      if (prevCount > 1) {
        return (prevCount -= 1);
      } else {
        return (prevCount = 1);
      }
    });
  };

  useEffect(() => {
    setPrice(count * 10);
  }, [count]);

  const stripe = useStripe();
  const elements = useElements();

  const paymentForm = useMutation({
    mutationFn: tkFetch.post("/api/v1/pricing"),
  });

  const handleSubscription = async (data) => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: {
        name: data.email,
      },
    });
    const apiData = {
      payment_method_id: result?.paymentMethod?.id,
      email: data.email,
      name: address.fullName,
      addressLine1: address.line1,
      addressLine2: address.line2,
      addressCity: address.city,
      addressState: address.state,
      addressCountry: address.country,
      addressZip: address.postal_code,
      quantity: count,
    };

    // check if email, name, addressLine1, addressCity, addressState, addressCountry, addressZip, quantity are not empty
    // if (
    //   apiData.email === "" ||
    //   apiData.name === "" ||
    //   apiData.addressLine1 === "" ||
    //   apiData.addressCity === "" ||
    //   apiData.addressState === "" ||
    //   apiData.addressCountry === "" ||
    //   apiData.addressZip === "" ||
    //   apiData.quantity === ""
    // ) {
    //   setErrorMsg("Please fill all details");
    //   setIsProcessing(false);
    //   return;
    // }

    paymentForm.mutate(apiData, {
      onSuccess: (data) => {
        const { client_secret, status } = data;
        if (status === "requires_action") {
          stripe.confirmCardPayment(client_secret).then((result) => {
            if (result.error) {
              console.log("error", result.error.message);
            } else {
              console.log("result", result);
            }
          });
        } else {
          console.log("success");
        }
      },
      onError: (error) => {
        console.log("error: ", error);
      },
    });

    setIsProcessing(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <TkCard className="payment-card">
        {/* <div className="card-header text-center">
          <h3>Workspace Plan</h3>
        </div> */}
        <TkCardBody>
          <TkRow>
            <TkCol lg={6}>
              <TkForm onSubmit={handleSubmit(handleSubscription)}>
                <TkRow className="g-3">
                  <TkCol lg={12}>
                    <AddressElement
                      options={{
                        mode: "billing",
                        fields: {
                          phone: "always",
                        },
                        validation: {
                          phone: {
                            required: "always",
                          },
                        },
                      }}
                      place
                      onChange={(event) => {
                        if (event.complete) {
                          const address = event.value.address;
                          address.fullName = event.value.name;
                          address.phone = event.value.phone;

                          setAddress(address);
                        }
                      }}
                    />

                    <TkCol lg={12} className="mt-2">
                      <TkInput
                        {...register("email")}
                        id="email"
                        type="email"
                        labelName="Email"
                        className="StripeElement"
                        requiredStarOnLabel={true}
                      />
                    </TkCol>
                    <TkLabel htmlFor="cardNumber" className="mt-2" requiredStarOnLabel={true}>
                      Card Number
                    </TkLabel>
                    <div className="card-details">
                      <CardElement />
                    </div>
                  </TkCol>
                  {/* <TkCol lg={12} className="mt-3 d-flex justify-content-center"> */}
                    <TkButton disabled={isProcessing || !stripe || !elements} color="primary" type="submit">
                      <span id="button-text">{isProcessing ? "Processing ... " : `Pay $${price}`}</span>
                    </TkButton>
                  {/* </TkCol> */}
                </TkRow>
              </TkForm>
            </TkCol>
            <TkCol lg={6} className="d-flex align-items-center justify-content-center">
              <TkContainer>
                <div>
                  <div className="card pricing-card text-center">
                    <div className="card-header">
                      <h4>Pricing</h4>
                    </div>
                    <div className="card-body">
                      <h1>${price}</h1>
                      <p className="card-text">Per Month</p>
                      <p className="card-text">Select how many Users</p>
                      <TkRow className="mb-3">
                        <TkCol>
                          <div className="d-flex justify-content-end">
                            <TkButton color="primary" type="button" onClick={decrement}>
                              -
                            </TkButton>
                          </div>
                        </TkCol>
                        <TkCol>
                          <div>
                            <h2>{count}</h2>
                          </div>
                        </TkCol>
                        <TkCol>
                          <div className="d-flex justify-content-start">
                            <TkButton color="primary" type="button" onClick={increment}>
                              +
                            </TkButton>
                          </div>
                        </TkCol>
                      </TkRow>
                    </div>
                    <div className="card-footer text-muted">Features List</div>
                  </div>
                </div>
              </TkContainer>
            </TkCol>
            {/* <TkCol lg={12}>{errorMsg && <FormErrorBox errMessage={errorMsg} />}</TkCol> */}
          </TkRow>
        </TkCardBody>
      </TkCard>
    </div>
  );
}

export default PaymentForm;
