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
import {
  MinPasswordLength,
  MaxPasswordLength,
  API_BASE_URL,
  urls,
} from "../src/utils/Constants";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import {
  TkToastError,
  TkToastSuccess,
} from "../src/components/TkToastContainer";
import tkFetch from "../src/utils/fetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import TkLoader from "../src/components/TkLoader";

const schema = Yup.object({
  // email will be coming for the invite link and backend
  email: Yup.string(),

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

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (router.isReady) {
      setEmail(router.query.email);
    }
  }, [router.isReady, router.query.email]);

  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
  }, [email, setValue]);

  const savePassword = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/users/accept-invite`),
  });

  const resetPassword = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/reset-password`),
  });

  const onSubmit = async (data) => {
    // savePassword.mutate(
    //   {
    //     token: router.query.token,
    //     password: data.password,
    //   },
    //   {
    //     onSuccess: async (successData) => {
    //       TkToastSuccess("Password saved successfully");
    //       await signIn("credentials", {
    //         email: data.email,
    //         password: data.password,
    //         redirect: false,
    //       });
    //       router.push(`${urls.inviteUserDetails}?token=${router.query.token}`);
    //     },
    //     onError: (err) => {
    //       TkToastError("Error while saving password");
    //       console.log(err);
    //     },
    //   }
    // );
    const apiData = {
      email: email,
      password: data.password,
    };

    resetPassword.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Password updated Successfully");
        router.push(`${urls.login}`);
      },
      onError: (error) => {
        console.log("error", error);
        // TkToastError("Lead not updated", error);
      },
    });
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
                  <TkCardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Create New Account</h5>
                      {/* <p className="text-muted">Create your {process.env.NEXT_PUBLIC_APP_NAME} account now</p> */}
                    </div>
                    <div className="p-2 mt-4">
                      <TkForm
                        onSubmit={handleSubmit(onSubmit)}
                        className="needs-validation"
                      >
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
                            <FormErrorText>
                              {errors.password?.message}
                            </FormErrorText>
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

                        <div className="mb-4">
                          <p className="mb-0 fs-12 text-muted fst-italic">
                            By registering you agree to the{" "}
                            {process.env.NEXT_PUBLIC_APP_NAME}{" "}
                            <Link href="/terms-and-conditions">
                              <a className="text-primary text-decoration-underline fst-normal fw-medium">
                                Terms of Use
                              </a>
                            </Link>
                          </p>
                        </div>

                        <div className="mt-4">
                          <TkButton
                            loading={savePassword.isLoading}
                            className="w-100 login-button-height"
                            color="primary"
                            type="submit"
                          >
                            Sign Up
                          </TkButton>
                        </div>
                        {savePassword.isError ? (
                          <FormErrorBox
                            errMessage={savePassword.error?.message}
                          />
                        ) : null}
                      </TkForm>
                    </div>
                  </TkCardBody>
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
