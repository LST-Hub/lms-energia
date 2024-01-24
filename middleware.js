import { NextResponse } from "next/server";

export async function middleware(req) {
  try {
    return NextResponse.next();
  } catch (err) {
    // TODO:  send this error to error reporting service, IMP: this is a critical error
    console.error("error in midddleware", err);
    //TODO: it seems that nextresponse.error() dosent work in middleware, not tested tough,
    // but return a response error like Something went wrong to request., may be in next 12 veersion , if we port this to next 13
    // NextResponse.error();
  }
}
