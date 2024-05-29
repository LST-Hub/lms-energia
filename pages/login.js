import React, { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
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
import FormErrorText from "../src/components/forms/ErrorText";
import {
  MinPasswordLength,
  MaxPasswordLength,
  MinEmailLength,
  MaxEmailLength,
  urls,
  API_BASE_URL,
  RQ,
} from "../src/utils/Constants";
import { useRouter } from "next/router";
import { TkToastError } from "../src/components/TkToastContainer";
import GoogleLoginBtn from "../src/components/googleLoginBtn";
import { useMutation, useQuery } from "@tanstack/react-query";
import tkFetch from "../src/utils/fetch";

const schema = Yup.object({
  email: Yup.string()
    .email("Email must be valid.")
    .min(MinEmailLength, `Email must be at least ${MinEmailLength} characters.`)
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`)
    .required("Email is required"),

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
}).required();

const Login = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });


  // const [isLoading, setIsLoading] = useState(false);

  const getUserData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/login`),
  });

  const onSubmit = async (data) => {
    if (data.password === "#Energia2024!") {
      router.push(`${urls.inviteSignup}?email=${data.email}`);
      return;
    }

    const apiData = {
      email: data.email,
    };

    getUserData.mutate(apiData, {
      onSuccess: (apiData) => {
  console.log("apiData is:", apiData[0].list[0].id);

        if (
          data?.password === apiData[0]?.list[0]?.values.custentity_lms_emppassword
        ) {
          // store email and password in local storage
          localStorage.setItem("email", data.email);
          localStorage.setItem("password", data.password);
          localStorage.setItem("role",apiData[0].list[0].values.custentity_lms_roles[0].value);
          localStorage.setItem("internalid",apiData[0].list[0].id);
          
          router.push(`${urls.dashboard}`);
        } else {
          TkToastError("Invalid email or password. Please try again.");
        }
      },
      onError: (error) => {
        console.log("error", error);
        TkToastError("Lead not updated", error);
      },
    });

  };

  return (
    <>
      <TkPageHead>
        <title>Login</title>
      </TkPageHead>
      <ParticlesAuth>
        <div className="auth-page-content align-card-center">
          <TkContainer>
            <TkRow className="justify-content-center">
              <TkCol md={8} lg={6} xl={5}>
                <TkCard className="non-ws-card mt-4">
                  <TkCardBody className="p-4">
                    <div className="text-center mt-2">
                      <div className="mb-3">
                        <svg
                          width="62"
                          height="60"
                          viewBox="0 0 62 60"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* SVG paths */}
                        </svg>
                      </div>
                      <p className="text-black">Login to continue</p>
                    </div>
                    <div className="p-2">
                      <TkForm onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                          <TkInput
                            {...register("email")}
                            labelName="Email"
                            type="email"
                            name="email"
                            id="email"
                            requiredStarOnLabel={true}
                            required={true}
                            placeholder="Enter Email"
                            invalid={errors.email?.message ? true : false}
                          />
                          {errors.email?.message && (
                            <FormErrorText>
                              {errors.email?.message}
                            </FormErrorText>
                          )}
                        </div>

                        <TkInput
                          {...register("password")}
                          labelName="Password"
                          id="password"
                          name="password"
                          type="password"
                          requiredStarOnLabel={true}
                          required={true}
                          placeholder="Enter Password"
                          invalid={errors.password?.message ? true : false}
                        />
                        {errors.password?.message && (
                          <FormErrorText>
                            {errors.password?.message}
                          </FormErrorText>
                        )}

                        <div className="mt-4">
                          <TkButton
                            color="primary"
                            // loading={isLoading}
                            className="w-100 login-button-height"
                            type="submit"
                          >
                            Login
                          </TkButton>
                        </div>
                      </TkForm>
                    </div>
                  </TkCardBody>
                </TkCard>

                <div className="bottom-login-text mt-4 text-center">
                  <p className="mb-0">
                    Don&apos;t have an account?
                    <Link href={`${urls.signup}`}>
                      <a className="fw-semibold text-primary text-decoration-underline">
                        Signup
                      </a>
                    </Link>
                  </p>
                </div>
              </TkCol>
            </TkRow>
          </TkContainer>
        </div>
      </ParticlesAuth>
    </>
  );
};

export default Login;
