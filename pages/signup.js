import React, { useState } from "react";
import Link from "next/link";

import ParticlesAuth from "../src/utils/ParticlesAuth";

import TkInput from "../src/components/forms/TkInput";
import TkForm from "../src/components/forms/TkForm";
import TkRow, { TkCol } from "../src/components/TkRow";
import TkCard, { TkCardBody } from "../src/components/TkCard";
import TkContainer from "../src/components/TkContainer";
import TkButton from "../src/components/TkButton";
import TkIcon from "../src/components/TkIcon";
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
  MinNameLength,
  MaxNameLength,
  API_BASE_URL,
  urls,
} from "../src/utils/Constants";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { TkToastError, TkToastSuccess } from "../src/components/TkToastContainer";
import GoogleLoginBtn from "../src/components/googleLoginBtn";

const schema = Yup.object({
  email: Yup.string()
    .email("Email must be valid.")
    .min(MinEmailLength, `Email must be at least ${MinEmailLength} character.`)
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`)
    .required("Email is required"),

  password: Yup.string()
    .min(MinPasswordLength, `Password should contain at least ${MinPasswordLength} character`)
    .max(MaxPasswordLength, `Password cannot contain more than ${MaxPasswordLength} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#^()+!%*?&])[A-Za-z\d@$#^()+!%*?&]{8,32}$/,
      "Password must have One Uppercase, One Lowercase, One Number and one Special Character. \n Special Characters can be on of @ $ # ^ ( ) + ! % * ? &"
    )
    .required("Password is required"),

  firstName: Yup.string()
    .min(MinNameLength, `First Name should contain at least ${MinNameLength} character`)
    .max(MaxNameLength, `First Name cannot contain more than ${MaxNameLength} characters`)
    .required("Name is required"),

  lastName: Yup.string()
    .min(MinNameLength, `Last Name should contain at least ${MinNameLength} character`)
    .max(MaxNameLength, `Last Name cannot contain more than ${MaxNameLength} characters`)
    .required("Name is required"),

  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Password and Confirm Password must match"),
}).required();

const Register = () => {
  const router = useRouter();

  const googleSignupHandler = async () => {
    await signIn("google", { callbackUrl: `${urls.start}` }); // it redirects use to dashboard after signIn
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const OnSubmit = (formData) => {
    setIsLoading(true);
    // TODO: upadte this fetch call with react query wrapper
    const user = fetch(`${API_BASE_URL}/users/new-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        if (res.error) {
          TkToastError(res.error, { autoClose: 5000 });
          console.log("error", res.error);
        } else {
          const data = await res.json();
          if (data.success) {
            try {
              await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
              });
              setIsLoading(false);
              TkToastSuccess("Account created Successfully", { autoClose: 5000 });
              router.push(`${urls.start}`);
            } catch (err) {
              setIsLoading(false);
              console.log(err, "error occured");
              TkToastError("Some Error occured while creating user. Please try again", { autoClose: 5000 });
            }
          } else {
            setIsLoading(false);
            TkToastError(data.message, { autoClose: 5000 });
          }
        }
      })
      .catch((err) => {
        setIsLoading(false);
        TkToastError("Some Error occured while creating user. Please try again Later.", { autoClose: 5000 });
        console.log("err", err);
      });
  };

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // dont remove this function though it has empty body, because else page will be refreshed with an error
      // console.log("unauthenticated");
    },
  });
  if (status === "authenticated") {
    router.push(`${urls.dashboard}`);
  }

  return (
    <>
      <TkPageHead>
        <title>{`SignUp - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>
      <ParticlesAuth>
        <div className="auth-page-content align-card-center">
          <div className="top-header">
            <div className="top-text me-4">
              <div className="text-muted fs-5">Already have an account ?</div>
            </div>
            <div>
              <Link href={`${urls.login}`}>
                <TkButton type="button" color="primary">
                  Login
                </TkButton>
              </Link>
            </div>
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
                      <div className="mb-1">
                        <svg width="62" height="60" viewBox="0 0 62 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M16.4275 59.1838L13.1427 55.4297C12.796 55.0335 12.8159 54.4363 13.1882 54.0641L27.6905 39.562C30.987 36.79 33.0747 39.1225 33.9538 39.8916L47.8116 54.0642C48.1767 54.4375 48.193 55.0288 47.8492 55.4218L44.5574 59.1838C44.1727 59.6235 43.4947 59.6411 43.0876 59.2221L32.6352 48.4623C30.6573 46.3497 29.6684 47.3387 28.3498 48.4623L17.8974 59.2221C17.4903 59.6411 16.8122 59.6235 16.4275 59.1838Z"
                            fill="#2885FC"
                          />
                          <path
                            d="M16.4275 0.81621L13.1427 4.57032C12.796 4.96653 12.8159 5.56367 13.1882 5.93594L27.6905 20.438C30.987 23.21 33.0747 20.8775 33.9538 20.1084L47.8116 5.93584C48.1767 5.5625 48.193 4.97116 47.8492 4.57821L44.5574 0.81621C44.1727 0.376545 43.4947 0.358885 43.0876 0.777929L32.6352 11.5377C30.6573 13.6503 29.6684 12.6613 28.3498 11.5377L17.8974 0.777929C17.4903 0.358885 16.8122 0.376545 16.4275 0.81621Z"
                            fill="#2885FC"
                          />
                          <path
                            d="M59.7509 44.1958L55.9501 47.4265C55.5489 47.7675 54.9521 47.739 54.5852 47.3614L40.2927 32.6525C37.5683 29.3166 39.9305 27.2625 40.7122 26.3946L55.0821 12.7415C55.4606 12.3819 56.0521 12.374 56.4401 12.7234L60.1545 16.0688C60.5886 16.4598 60.5965 17.1381 60.1717 17.5391L49.263 27.836C47.1223 29.7834 48.097 30.7864 49.2015 32.121L59.8103 42.7267C60.2234 43.1397 60.196 43.8175 59.7509 44.1958Z"
                            fill="#2885FC"
                          />
                          <path
                            d="M1.2757 44.1958L5.07656 47.4265C5.4777 47.7675 6.0745 47.739 6.44138 47.3614L20.7339 32.6525C23.4583 29.3166 21.0961 27.2625 20.3144 26.3946L5.94453 12.7415C5.566 12.3819 4.97449 12.374 4.58651 12.7234L0.872122 16.0688C0.438022 16.4598 0.430092 17.1381 0.854934 17.5391L11.7636 27.836C13.9043 29.7834 12.9296 30.7864 11.8251 32.121L1.21634 42.7267C0.803179 43.1397 0.830565 43.8175 1.2757 44.1958Z"
                            fill="#2885FC"
                          />
                          <circle cx="30.3277" cy="30.3276" r="3.95579" fill="#2885FC" />
                        </svg>
                      </div>
                      <p className="text-black">Create New Account</p>
                      {/* <p className="text-muted">Get your {process.env.NEXT_PUBLIC_APP_NAME} account now</p> */}
                    </div>
                    <div className="p-2 mt-1">
                      <TkForm onSubmit={handleSubmit(OnSubmit)} className="needs-validation">
                        <div className="mb-3">
                          <TkInput
                            {...register("email")}
                            labelName="Email"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter Email Address"
                            requiredStarOnLabel={true}
                            required={true}
                            invalid={errors.email?.message ? true : false}
                          />
                          {errors.email?.message ? <FormErrorText>{errors.email?.message}</FormErrorText> : null}
                        </div>

                        <TkRow>
                          <TkCol md={6}>
                            <div className="mb-3">
                              <TkInput
                                {...register("firstName")}
                                labelName="First Name"
                                type="text"
                                id="firstName"
                                placeholder="Enter First Name"
                                requiredStarOnLabel={true}
                                required={true}
                              />
                              {errors.firstName?.message ? (
                                <FormErrorText>{errors.firstName?.message}</FormErrorText>
                              ) : null}
                            </div>
                          </TkCol>

                          <TkCol md={6}>
                            <div className="mb-3">
                              <TkInput
                                {...register("lastName")}
                                labelName="Last Name"
                                type="text"
                                id="lastName"
                                placeholder="Enter Last Name"
                                requiredStarOnLabel={true}
                                required={true}
                              />
                              {errors.lastName?.message ? (
                                <FormErrorText>{errors.lastName?.message}</FormErrorText>
                              ) : null}
                            </div>
                          </TkCol>

                          <div className="mb-3">
                            <TkInput
                              {...register("password")}
                              labelName="Password"
                              type="password"
                              id="password"
                              name="password"
                              placeholder="Enter Password"
                              requiredStarOnLabel={true}
                              required={true}
                              invalid={errors.password?.message ? true : false}
                            />
                            {errors.password?.message ? (
                              <FormErrorText>{errors.password?.message}</FormErrorText>
                            ) : null}
                          </div>
                        </TkRow>

                        <div className="mb-2">
                          <TkInput
                            {...register("confirmPassword")}
                            labelName="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
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

                        <div className="mt-4 login-button-height">
                          <TkButton loading={isLoading} color="primary" className="w-100" type="submit">
                            Sign Up
                          </TkButton>
                        </div>
                      </TkForm>
                      <div className="mt-4 text-center">
                        {/* <div className="signin-other-title">
                          <h5 className="fs-13 mb-4 title text-muted">OR</h5>
                        </div> */}
                        <div>
                          <GoogleLoginBtn onClick={googleSignupHandler} btnText={"SignUp with Google"} />
                        </div>
                      </div>
                    </div>
                  </TkCardBody>
                </TkCard>
                <div className="bottom-login-text mt-4 text-center">
                  <p className="mb-0">
                    Already have an account ?{" "}
                    <Link href={`${urls.login}`}>
                      <a className="fw-semibold text-primary text-decoration-underline"> Login</a>
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

export default Register;

// Register.noLayout = true;
