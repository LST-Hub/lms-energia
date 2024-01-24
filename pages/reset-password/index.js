import React, { useRef, useState } from "react";
import ParticlesAuth from "../../src/utils/ParticlesAuth";
import Link from "next/link";
import { useRouter } from "next/router";

import TkInput from "../../src/components/forms/TkInput";
import TkForm from "../../src/components/forms/TkForm";
import TkRow, { TkCol } from "../../src/components/TkRow";
import TkCard, { TkCardBody } from "../../src/components/TkCard";
import TkContainer from "../../src/components/TkContainer";
import TkButton from "../../src/components/TkButton";
import TkPageHead from "../../src/components/TkPageHead";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText from "../../src/components/forms/ErrorText";
import {
  MinPasswordLength,
  MaxPasswordLength,
  API_BASE_URL,
  urls,
} from "../../src/utils/Constants";
import { useEffect } from "react";
import {
  TkToastError,
  TkToastSuccess,
} from "../../src/components/TkToastContainer";
import { useMutation } from "@tanstack/react-query";
import tkFetch from "../../src/utils/fetch";
import TkLoader from "../../src/components/TkLoader";

const schema = Yup.object({
  password: Yup.string()
    .min(
      MinPasswordLength,
      `Password should contain at least ${MinPasswordLength} characters`
    )
    .max(
      MaxPasswordLength,
      `Password cannot contain more than ${MaxPasswordLength} characters`
    )
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#^()+!%*?&])[A-Za-z\d@$#^()+!%*?&]{8,32}$/,
      "Password must have One Uppercase, One Lowercase, One Number and one Special Character. \n Special Characters can be on of @ $ # ^ ( ) + ! % * ? &"
    )
    .required("Password is required"),

  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Password and Confirm Password must match"
  ),
}).required();

const BasicPassReset = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [tokenValid, setTokenValid] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const verifyToken = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/users/verify-token`),
  });

  const resetPass = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/users/password/reset`),
  });

  const verifyTokenCalled = useRef(false);
  useEffect(() => {
    if (!verifyTokenCalled.current && router.query.token) {
      verifyToken.mutate(
        { token: router.query.token },
        {
          onSuccess: (data) => {
            setTokenValid(true);
            setVerifying(false);
          },
          onError: (err) => {
            console.log(err);
            setVerifying(false);
            setTokenValid(false);
            setTokenError(err.message);
          },
        }
      );
      verifyTokenCalled.current = true;
    }
  }, [router.query.token, verifyToken]);

  const OnSubmit = (data) => {
    // e.preventDefault();
    setIsLoading(true);
    resetPass.mutate(
      { password: data.password, token: router.query.token },
      {
        onSuccess: (data) => {
          TkToastSuccess(
            "Password updated sucessfully. Please login with new password."
          );
          setIsLoading(false);
          router.push(`${urls.login}`);
        },
        onError: (err) => {
          setIsLoading(false);
          TkToastError(err.message);
          console.log(err);
        },
      }
    );
  };

  return (
    <ParticlesAuth>
      <TkPageHead>
        <title>{`Reset Password`}</title>
      </TkPageHead>
      <div className="auth-page-content align-card-center">
        <TkContainer>
          <TkRow>
            <TkCol lg={12}>
              <div className="text-center mt-sm-5 mb-4">
                {/* <div>
                  <Link href="/">
                    <h1 className="text-light">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
                  </Link>
                </div> */}
              </div>
            </TkCol>
          </TkRow>
          <TkRow className="justify-content-center">
            <TkCol md={8} lg={6} xl={5}>
              <TkCard className="non-ws-card mt-4">
                {verifying ? (
                  <TkLoader />
                ) : (
                  <>
                    {tokenValid ? (
                      <TkCardBody className="p-4">
                        <div className="text-center mt-2">
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
                                <circle
                                  cx="60.9999"
                                  cy="56.9999"
                                  r="22.7333"
                                  fill="#CCE9FF"
                                />
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
                                  <feFlood
                                    floodOpacity="0"
                                    result="BackgroundImageFix"
                                  />
                                  <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                  />
                                  <feOffset dy="4" />
                                  <feGaussianBlur stdDeviation="15" />
                                  <feComposite in2="hardAlpha" operator="out" />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in2="BackgroundImageFix"
                                    result="effect1_dropShadow_201_708"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in="SourceGraphic"
                                    in2="effect1_dropShadow_201_708"
                                    result="shape"
                                  />
                                </filter>
                              </defs>
                            </svg>
                          </div>
                          <h4 className="text-primary">Create new password</h4>
                          {/* <p className="text-muted">Your new password must be different from previous used password.</p> */}
                        </div>

                        <div className="p-2">
                          <TkForm onSubmit={handleSubmit(OnSubmit)}>
                            <div className="mb-3">
                              <TkInput
                                {...register("password")}
                                labelName="New Password"
                                type={"password"}
                                name="password"
                                id="password"
                                placeholder="Enter new password"
                                invalid={
                                  errors.password?.message ? true : false
                                }
                                requiredStarOnLabel={true}
                              />
                              {errors.password?.message ? (
                                <FormErrorText>
                                  {errors.password?.message}
                                </FormErrorText>
                              ) : null}
                            </div>

                            <div className="mb-3">
                              <TkInput
                                {...register("confirmPassword")}
                                labelName="Confirm New Password"
                                type={"password"}
                                id="confrimPassword"
                                placeholder="Confirm new password"
                                requiredStarOnLabel={true}
                                invalid={
                                  errors.confirmPassword?.message ? true : false
                                }
                              />
                              {errors.confirmPassword?.message ? (
                                <FormErrorText>
                                  {errors.confirmPassword?.message}
                                </FormErrorText>
                              ) : null}
                            </div>

                            <div className="mt-4">
                              <TkButton
                                loading={isLoading}
                                color="primary"
                                className="w-100 login-button-height"
                                type="submit"
                              >
                                Reset Password
                              </TkButton>
                            </div>
                          </TkForm>
                        </div>
                      </TkCardBody>
                    ) : (
                      <TkCardBody className="p-4">
                        <div className="text-center mt-2">
                          <h4 className="text-primary">Invalid Token</h4>
                          <p className="text-muted">{tokenError}</p>
                        </div>
                      </TkCardBody>
                    )}
                  </>
                )}
              </TkCard>
            </TkCol>
          </TkRow>
        </TkContainer>
      </div>
    </ParticlesAuth>
  );
};

export default BasicPassReset;
