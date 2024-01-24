import React, { useState } from "react";
import ParticlesAuth from "../../src/utils/ParticlesAuth";

import Link from "next/link";
import { useRouter } from "next/router";

import TkInput from "../../src/components/forms/TkInput";
import TkForm from "../../src/components/forms/TkForm";
import TkRow, { TkCol } from "../../src/components/TkRow";
import TkCard, { TkCardBody } from "../../src/components/TkCard";
import TkContainer from "../../src/components/TkContainer";
import TkButton from "../../src/components/TkButton";
import TkAlert from "../../src/components/TkAlert";
import TkFormFeedback from "../../src/components/TkFormFeedback";
import TkPageHead from "../../src/components/TkPageHead";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText from "../../src/components/forms/ErrorText";
import { MinEmailLength, MaxEmailLength, urls } from "../../src/utils/Constants";
import { TkToastError, TkToastSuccess } from "../../src/components/TkToastContainer";
import TkIcon from "../../src/components/TkIcon";

const schema = Yup.object({
  email: Yup.string()
    .email("Email must be valid.")
    .min(MinEmailLength, `Email must be at least ${MinEmailLength} characters.`)
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`)
    .required("Email is required"),
}).required();

const ForgetPasswordPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data) => {
    setIsLoading(true);
    const sendLink = fetch("/api/v1/users/password/forgot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          TkToastSuccess("Password reset link sent to your email.");
          router.push(`${urls.login}`);
        } else {
          // console.log(data);
          TkToastError(data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <ParticlesAuth>
      <TkPageHead>
        <title>{`Forgot Password`}</title>
      </TkPageHead>

      <div className="auth-page-content align-card-center">
        <TkContainer>
          {/* <TkRow>
            <TkCol lg={12}>
              <div className="text-center mt-sm-5 mb-4">
                <div></div>
              </div>
            </TkCol>
          </TkRow> */}
          <TkRow className="justify-content-center">
            <TkCol md={8} lg={6} xl={5}>
              <TkCard className="non-ws-card mt-4">
                <TkCardBody className="p-4">
                  <div className="text-center">
                    {/* <h1 className="ri-mail-send-line"></h1> */}
                    <div>
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 122 122"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g filter="url(#filter0_d_201_708)">
                          <circle cx="61" cy="57" r="31" fill="#EDF7FF" />
                          <circle cx="60.9999" cy="56.9999" r="22.7333" fill="#CCE9FF" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M49.2763 54.4798C45.4783 57.0134 44.4537 62.1458 46.9873 65.9439C49.521 69.742 54.6534 70.7672 58.4512 68.2338C61.7783 66.0144 62.9771 61.8009 61.5209 58.2364L64.4092 56.3097L66.2441 59.0605C66.7509 59.8201 67.7772 60.0251 68.5368 59.5184C69.2964 59.0117 69.5014 57.9853 68.9947 57.2257L67.1597 54.4749L68.5352 53.5573L70.3702 56.3081C70.8769 57.0678 71.9033 57.2727 72.6629 56.766C73.4225 56.2593 73.6275 55.2329 73.1208 54.4733L71.2858 51.7225L74.0366 49.8875C74.7962 49.3808 75.0012 48.3545 74.4945 47.5949C73.9878 46.8352 72.9614 46.6303 72.2018 47.137L59.6862 55.4858C56.955 52.7719 52.6039 52.2604 49.2766 54.48L49.2763 54.4798ZM49.7377 64.1092C48.2176 61.8305 48.8326 58.7509 51.1114 57.2308C53.3901 55.7107 56.4697 56.3257 57.9898 58.6044C59.5099 60.8832 58.8949 63.9628 56.6161 65.4829C54.3374 67.003 51.2578 66.388 49.7377 64.1092Z"
                            fill="#0093FF"
                          />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_201_708"
                            x="0"
                            y="0"
                            width="122"
                            height="122"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="4" />
                            <feGaussianBlur stdDeviation="15" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_201_708" />
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_201_708" result="shape" />
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <h2 className="mb-4">Forgot Password?</h2>
                    <span className="fs-16">Please enter the email address associated with your account, and we&apos;ll send you a link to reset your password.</span>
                  </div>
                  {/* <TkAlert className="alert-borderless alert-warning text-center mb-2 mx-2" role="alert">
                    Enter your email and instructions will be sent to you!
                  </TkAlert> */}
                  <div className="p-2 mt-4">
                    <TkForm onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                        <TkInput
                          {...register("email")}
                          type="email"
                          id="email"
                          labelName="Email"
                          placeholder="Enter your email"
                          requiredStarOnLabel={true}
                          invalid={errors.email?.message ? true : false}
                        />
                        {errors.email?.message ? <FormErrorText>{errors.email?.message}</FormErrorText> : null}
                      </div>

                      <div className="text-center mt-4">
                        <TkButton
                          loading={isLoading}
                          className="w-100 login-button-height"
                          color="primary"
                          type="submit"
                        >
                          Send Reset Link
                        </TkButton>
                      </div>
                    </TkForm>
                  </div>
                  <div className="mt-3">
                    <Link href={`${urls.login}`}>
                      <a className="font-weight-bold text-muted">
                        {" "}
                        <b className="d-flex align-items-center justify-content-center">
                          <TkIcon className={"ri-arrow-left-s-line me-1"} />
                          Back to Login
                        </b>
                      </a>
                    </Link>
                  </div>
                </TkCardBody>
              </TkCard>
            </TkCol>
          </TkRow>
          {/* <Link href={`${urls.login}`}>
              <a className="font-weight-bold">
                {" "}
                <b className="d-flex align-items-center justify-content-center">
                  <TkIcon className={"ri-arrow-left-s-line me-1"} />
                  Back to Login
                </b>
              </a>
            </Link> */}
        </TkContainer>
      </div>
    </ParticlesAuth>
  );
};

export default ForgetPasswordPage;
