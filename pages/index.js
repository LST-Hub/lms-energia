import { useRouter } from "next/router";
import { useEffect } from "react";
import { urls } from "../src/utils/Constants";
import Head from "next/head";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push(`${urls.dashboard}`);
  }, [router]);
  return <div></div>;
}
