import React, { useState, useEffect } from "react";
import Link from "next/link";

import ParticlesAuth from "../src/utils/ParticlesAuth";

import TkInput from "../src/components/forms/TkInput";
import TkForm from "../src/components/forms/TkForm";
import TkRow, { TkCol } from "../src/components/TkRow";
import TkCard, { TkCardBody } from "../src/components/TkCard";
import TkContainer from "../src/components/TkContainer";
import TkButton from "../src/components/TkButton";
import TkPageHead from "../src/components/TkPageHead";

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../src/components/forms/ErrorText";
import { MinPasswordLength, MaxPasswordLength, API_BASE_URL, urls } from "../src/utils/Constants";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { TkToastError, TkToastSuccess } from "../src/components/TkToastContainer";
import tkFetch from "../src/utils/fetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import TkLoader from "../src/components/TkLoader";

const schema = Yup.object({
  // email will be coming for the invite link and backend
  email: Yup.string(),

  password: Yup.string()
    .min(MinPasswordLength, `Password should contain at least ${MinPasswordLength} characters`)
    .max(MaxPasswordLength, `Password cannot contain more than ${MaxPasswordLength} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#^()+!%*?&])[A-Za-z\d@$#^()+!%*?&]{8,32}$/,
      "Password must have One Uppercase, One Lowercase, One Number and one Special Character. \n Special Characters can be on of @ $ # ^ ( ) + ! % * ? &"
    )
    .required("Password is required"),

  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Password and Confirm Password must match"),
}).required();

const Register = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["token"], // just given a random key, as we dont want to cache it
    queryFn: tkFetch.postWithBody(`${API_BASE_URL}/users/verify-token`, { token: router.query.token }),
    onSuccess: (data) => {
      setValue("email", data[0].email);
    },
    enabled: router.isReady, // dont run the query if router is not ready
  });

  const savePassword = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/users/accept-invite`),
  });

  const onSubmit = async (data) => {
    savePassword.mutate(
      {
        token: router.query.token,
        password: data.password,
      },
      {
        onSuccess: async (successData) => {
          TkToastSuccess("Password saved successfully");
          await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });
          router.push(`${urls.inviteUserDetails}?token=${router.query.token}`);
        },
        onError: (err) => {
          TkToastError("Error while saving password");
          console.log(err);
        },
      }
    );
  };

  return (
    <>
      <TkPageHead>
        <title>{`SignUp - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>

      <ParticlesAuth>
        <div className="auth-page-content">
          <div className="bg-design-bottom-container">
            <div className="bg-design-bottom-one"></div>
            <div className="bg-design-bottom-two"></div>
            <div className="bg-design-bottom-three"></div>
          </div>
          <div className="bg-design-top-container">
            <div className="bg-design-top-one"></div>
            <div className="bg-design-top-two"></div>
            <div className="bg-design-top-three"></div>
          </div>
          <TkContainer>
            <TkRow>
              <TkCol lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    {/* <Link href="/">
                      <a className="d-inline-block auth-logo">
                        <h2 className="logo-text text-light">{process.env.NEXT_PUBLIC_APP_NAME}</h2>
                      </a>
                    </Link> */}
                  </div>
                </div>
              </TkCol>
            </TkRow>

            <TkRow className="justify-content-center">
              <TkCol md={8} lg={6} xl={5}>
                <TkCard className="non-ws-card mt-4">
                  {isLoading ? (
                    <TkLoader />
                  ) : isError ? (
                    <FormErrorBox errMessage={error?.message} />
                  ) : (
                    <TkCardBody className="p-4">
                      <div className="text-center mt-2">
                        <div className="mb-3">
                          <svg
                            width="58"
                            height="30"
                            viewBox="0 0 58 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M47.0546 0.593994L30.0059 20.7579V29.9997H38.8712V20.0377L47.0546 29.9997H57.2839L45.2815 15.2368L57.2839 0.593994H47.0546Z"
                              fill="#0093FF"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.86471 4.18572C8.70141 6.21178 6.7819 7.81081 4.43798 7.81081C1.98695 7.81081 0 6.06229 0 3.90538C0 1.74847 1.98695 -4.39882e-05 4.43798 -4.39882e-05C4.45907 -4.39882e-05 4.48013 8.54792e-05 4.50115 0.00034356L4.50085 0H34.7166H34.9158L34.9122 0.00372479C37.2725 0.0937989 39.1546 1.80619 39.1546 3.90543C39.1546 6.06233 37.1676 7.81085 34.7166 7.81085C32.3727 7.81085 30.4531 6.2118 30.2899 4.18572H23.5954L23.7318 29.8807H14.7301V4.18572H8.86471Z"
                              fill="#0093FF"
                            />
                          </svg>
                        </div>
                        <h5 className="text-primary">Create New Account</h5>
                        {/* <p className="text-muted">Create your {process.env.NEXT_PUBLIC_APP_NAME} account now</p> */}
                      </div>
                      <div className="p-2 mt-4">
                        <TkForm onSubmit={handleSubmit(onSubmit)} className="needs-validation">
                          <div className="mb-3">
                            <TkInput
                              {...register("email")}
                              labelName="Email"
                              type="email"
                              id="email"
                              required={true}
                              disabled={true}
                            />
                          </div>

                          <div className="mb-3">
                            <TkInput
                              {...register("password")}
                              labelName="Password"
                              type="password"
                              placeholder="Enter Password"
                              requiredStarOnLabel={true}
                              required={true}
                              invalid={errors.password?.message ? true : false}
                            />
                            {errors.password?.message ? (
                              <FormErrorText>{errors.password?.message}</FormErrorText>
                            ) : null}
                          </div>

                          <div className="mb-2">
                            <TkInput
                              {...register("confirmPassword")}
                              labelName="Confirm Password"
                              type="password"
                              placeholder="Enter Confirm Password"
                              requiredStarOnLabel={true}
                              required={true}
                              invalid={errors.confirmPassword?.message ? true : false}
                            />
                            {errors.confirmPassword?.message ? (
                              <FormErrorText>{errors.confirmPassword?.message}</FormErrorText>
                            ) : null}
                          </div>

                          <div className="mb-4">
                            <p className="mb-0 fs-12 text-muted fst-italic">
                              By registering you agree to the {process.env.NEXT_PUBLIC_APP_NAME}{" "}
                              <Link href="/terms-and-conditions">
                                <a className="text-primary text-decoration-underline fst-normal fw-medium">
                                  Terms of Use
                                </a>
                              </Link>
                            </p>
                          </div>

                          <div className="mt-4">
                            <TkButton loading={savePassword.isLoading} className="w-100 login-button-height" color="primary" type="submit">
                              Sign Up
                            </TkButton>
                          </div>
                          {savePassword.isError ? <FormErrorBox errMessage={savePassword.error?.message} /> : null}
                        </TkForm>
                      </div>
                    </TkCardBody>
                  )}
                </TkCard>
              </TkCol>
            </TkRow>
          </TkContainer>
        </div>
      </ParticlesAuth>
    </>
  );
};

export default Register;
