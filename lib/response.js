export default function response({ res, success, status_code, data, message }) {
  if (!message) message = "";
  if (!data) data = [];
  
  if (process.env.NODE_ENV !== "production") {
    if (!Array.isArray(data))
      console.error("data passed to reponse function is not of array type. always pass data as array for consistency", data);
    if (typeof success !== "boolean")
      console.error("success is undefined in response function. Please always pass it as true or false", success);
    if (typeof status_code !== "number")
      console.error("status_code is not number in response function. Please always pass it as a correct status code", status_code);
    if (typeof message !== "string")
      console.error("message is not string in response function. Please always pass it as string", message);
    if(status_code !== 200 && success === true)
      console.error("success is true but status code is not 200. Please always pass correct status code", status_code);
  }

  if (status_code) {
    res.status(status_code).json({ success, data, message });
    return;
  }
  res.json({ success, data, message });
}
