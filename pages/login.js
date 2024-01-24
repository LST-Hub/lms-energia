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
import { MinPasswordLength, MaxPasswordLength, MinEmailLength, MaxEmailLength, urls } from "../src/utils/Constants";
import { useRouter } from "next/router";
import { TkToastError, } from "../src/components/TkToastContainer";
import GoogleLoginBtn from "../src/components/googleLoginBtn";

const schema = Yup.object({
  email: Yup.string()
    .email("Email must be valid.")
    .min(MinEmailLength, `Email must be at least ${MinEmailLength} characters.`)
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`)
    .required("Email is required"),

  password: Yup.string()
    .min(MinPasswordLength, `Password should contain at least ${MinPasswordLength} characters`)
    .max(MaxPasswordLength, `Password cannot contain more than ${MaxPasswordLength} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#^()+!%*?&])[A-Za-z\d@$#^()+!%*?&]{8,32}$/,
      "Password must have One Uppercase, One Lowercase, One Number and one Special Character. \n Special Characters can be on of @ $ # ^ ( ) + ! % * ? &"
    )
    .required("Password is required"),

  // rememberMe: Yup.boolean(),
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

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    //implement auth logic here
    setIsLoading(true);
    signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
      .then((res) => {
        setIsLoading(false);
        if (res.error) {
          TkToastError(res.error, { autoClose: 5000 });
        } else {
          // console.log("res", res.status);
          router.push(`${urls.dashboard}`);
        }
      })
      .catch((err) => {
        TkToastError("Some Error occured, Please try again later", { autoClose: 5000 });
        console.log("err", err);
      });
  };

  const googleLoginHabdler = async () => {
    await signIn("google", { callbackUrl: `${urls.dashboard}` }); // it redirects use to dashboard after signIn
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
        <title>{`Login - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
      </TkPageHead>
      <ParticlesAuth>
        <div className="auth-page-content align-card-center">
          <div className="top-header">
            <div className="top-text me-4">
              <div className="text-muted fs-5">Don&apos;t have an account ?</div>
            </div>
            <div>
              <Link href={`${urls.signup}`}>
                <TkButton type="button" color="primary">
                  SignUp
                </TkButton>
              </Link>
            </div>
          </div>
          <TkContainer>
            <TkRow className="justify-content-center">
              <TkCol md={8} lg={6} xl={5}>
                <TkCard className="non-ws-card mt-4">
                  <TkCardBody className="p-4">
                    <div className="text-center mt-2">
                      {/* <h5 className="text-primary">Welcome!</h5> */}
                      <div className="mb-3">
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
                      <p className="text-black">Login to continue</p>
                    </div>
                    <div className="p-2">
                      <TkForm onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                          {/* TODO: add validation taht it is required */}
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
                          {errors.email?.message ? <FormErrorText>{errors.email?.message}</FormErrorText> : null}
                        </div>

                        <div className="mb-3">
                          <div className="float-end">
                            <Link href={`${urls.forgotPassword}`}>
                              <a className="text-muted">Forgot password? </a>
                            </Link>
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
                          {errors.password?.message ? <FormErrorText>{errors.password?.message}</FormErrorText> : null}
                        </div>

                        {/* <div className="form-check">
                          <TkCheckBox
                            {...register("rememberMe")}
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id="auth-remember-check"
                          />
                          <TkLabel className="form-check-label" id="auth-remember-check">
                            Remember me
                          </TkLabel>
                        </div> */}

                        <div className="mt-4">
                          <TkButton
                            color="primary"
                            loading={isLoading}
                            className="w-100 login-button-height"
                            type="submit"
                          >
                            Login
                          </TkButton>
                        </div>
                      </TkForm>

                      <div className="mt-4 text-center">
                        {/* <div className="signin-other-title">
                          <h5 className="fs-13 mb-4 title">OR</h5>
                        </div> */}
                        <div>
                          <GoogleLoginBtn onClick={googleLoginHabdler} btnText={"Login with Google"} />
                        </div>
                      </div>
                    </div>
                  </TkCardBody>
                </TkCard>

                <div className="bottom-login-text mt-4 text-center">
                  <p className="mb-0">
                    Don&apos;t have an account ?
                    <Link href={`${urls.signup}`}>
                      <a className="fw-semibold text-primary text-decoration-underline"> Signup</a>
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

// Login.noLayout = true;
