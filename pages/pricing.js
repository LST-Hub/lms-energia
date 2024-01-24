import React, { useEffect, useState } from "react";
import TkPageHead from "../src/components/TkPageHead";
import TkContainer from "../src/components/TkContainer";
import TkRow, { TkCol } from "../src/components/TkRow";
import TkButton from "../src/components/TkButton";
import TkForm from "../src/components/forms/TkForm";
import { useForm } from "react-hook-form";

const Pricing = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const [count, setCount] = useState(1);
  const [price, setPrice] = useState(10);

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

  const onSubmit = (data) => {
    data.users = count;
    console.log(data);
  };

  return (
    <>
      <TkPageHead>
        <title>{`Workspace Plans - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>
      <TkContainer>
        <div>
          <div className="card text-center">
            <div className="card-header">
              <h4>Pricing</h4>
            </div>
            <div className="card-body">
              <h1>${price}</h1>
              <p className="card-text">Per Month</p>
              <p className="card-text">Select how many Users</p>
              <TkForm onSubmit={handleSubmit(onSubmit)}>
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
                <TkButton color="primary" type="submit">
                  Buy Now
                </TkButton>
              </TkForm>
            </div>
            <div className="card-footer text-muted">Features List</div>
          </div>
        </div>
      </TkContainer>
    </>
  );
};

export default Pricing;
